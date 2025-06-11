
import { supabase } from '@/integrations/supabase/client';
import { Comentario, TipoItem } from '@/types/comentario.types';

export const buscarComentarios = async (
  itemId: string, 
  itemTipo: TipoItem, 
  ehAdmin: boolean,
  userId?: string
) => {
  // Consulta principal para buscar comentários
  let query = supabase
    .from('comentarios')
    .select(`
      id,
      usuario_id,
      item_id,
      item_tipo,
      texto,
      data_criacao,
      data_atualizacao,
      visivel,
      curtidas,
      comentario_pai_id,
      trancado,
      trancado_por,
      data_trancamento,
      ocultado_por,
      data_ocultacao,
      ocultado_automaticamente
    `)
    .eq('item_id', itemId)
    .eq('item_tipo', itemTipo)
    .is('comentario_pai_id', null) // Busca apenas comentários principais
    .order('data_criacao', { ascending: false });
  
  if (!ehAdmin) {
    query = query.eq('visivel', true);
  }
  
  const { data: comentariosData, error: comentariosError } = await query;
  
  if (comentariosError) {
    console.error('Erro ao buscar comentários:', comentariosError);
    throw new Error('Erro ao carregar comentários');
  }

  // Buscar respostas para os comentários
  const { data: respostasData, error: respostasError } = await supabase
    .from('comentarios')
    .select(`
      id,
      usuario_id,
      item_id,
      item_tipo,
      texto,
      data_criacao,
      data_atualizacao,
      visivel,
      curtidas,
      comentario_pai_id,
      trancado,
      trancado_por,
      data_trancamento,
      ocultado_por,
      data_ocultacao,
      ocultado_automaticamente
    `)
    .in('comentario_pai_id', comentariosData.map(c => c.id))
    .order('data_criacao', { ascending: true });

  if (respostasError) {
    console.error('Erro ao buscar respostas:', respostasError);
    throw new Error('Erro ao carregar respostas');
  }

  // Coletar todos os IDs de usuários (de comentários, respostas, e ocultados/trancados por administradores)
  const todosUsuariosIds = new Set<string>();
  
  // Adiciona IDs de usuários dos comentários
  comentariosData.forEach(c => {
    todosUsuariosIds.add(c.usuario_id);
    if (c.ocultado_por) todosUsuariosIds.add(c.ocultado_por);
    if (c.trancado_por) todosUsuariosIds.add(c.trancado_por);
  });
  
  // Adiciona IDs de usuários das respostas
  (respostasData || []).forEach(r => {
    todosUsuariosIds.add(r.usuario_id);
    if (r.ocultado_por) todosUsuariosIds.add(r.ocultado_por);
    if (r.trancado_por) todosUsuariosIds.add(r.trancado_por);
  });
  
  // Converter Set para array para usar na consulta
  const usuariosIds = Array.from(todosUsuariosIds);
  
  // Buscar informações dos perfis de usuários
  const { data: perfisData, error: perfisError } = await supabase
    .from('perfis')
    .select('id, nome, avatar_url')
    .in('id', usuariosIds);
  
  if (perfisError) {
    console.error('Erro ao buscar perfis:', perfisError);
  }
  
  // Mapeamento de ID do usuário para dados do perfil
  const perfisPorUsuarioId = (perfisData || []).reduce((acc, perfil) => {
    acc[perfil.id] = perfil;
    return acc;
  }, {} as Record<string, { id: string, nome: string | null, avatar_url: string | null }>);
  
  // Buscar lista de administradores
  const { data: adminsData, error: adminsError } = await supabase
    .from('papeis_usuario')
    .select('user_id')
    .eq('papel', 'admin');
    
  if (adminsError) {
    console.error('Erro ao buscar administradores:', adminsError);
  }
  
  // Conjunto com IDs dos administradores
  const adminsIds = new Set((adminsData || []).map(admin => admin.user_id));

  // Processar respostas com informações de usuário
  const respostasProcessadas = (respostasData || []).map(r => {
    const ocultadoPorAdmin = r.ocultado_por ? {
      id: r.ocultado_por,
      nome: perfisPorUsuarioId[r.ocultado_por]?.nome || 'Administrador',
    } : null;
    
    const trancadoPorAdmin = r.trancado_por ? {
      id: r.trancado_por,
      nome: perfisPorUsuarioId[r.trancado_por]?.nome || 'Administrador',
    } : null;
    
    return {
      ...r,
      usuario_nome: perfisPorUsuarioId[r.usuario_id]?.nome || 'Usuário',
      usuario_avatar: perfisPorUsuarioId[r.usuario_id]?.avatar_url,
      curtido_pelo_usuario: userId ? false : false, // Será atualizado abaixo
      usuario_eh_admin: adminsIds.has(r.usuario_id),
      ocultado_por_admin: ocultadoPorAdmin,
      trancado_por_admin: trancadoPorAdmin
    };
  });

  // Agrupar respostas por comentário pai
  const respostasPorPai: Record<string, Comentario[]> = {};
  respostasProcessadas.forEach(resposta => {
    if (!respostasPorPai[resposta.comentario_pai_id]) {
      respostasPorPai[resposta.comentario_pai_id] = [];
    }
    respostasPorPai[resposta.comentario_pai_id].push(resposta as Comentario);
  });

  // Se não há usuário logado, retornamos os comentários sem verificar curtidas
  if (!userId) {
    return comentariosData.map(c => {
      const ocultadoPorAdmin = c.ocultado_por ? {
        id: c.ocultado_por,
        nome: perfisPorUsuarioId[c.ocultado_por]?.nome || 'Administrador',
      } : null;
      
      const trancadoPorAdmin = c.trancado_por ? {
        id: c.trancado_por,
        nome: perfisPorUsuarioId[c.trancado_por]?.nome || 'Administrador',
      } : null;
      
      return {
        ...c,
        usuario_nome: perfisPorUsuarioId[c.usuario_id]?.nome || 'Usuário',
        usuario_avatar: perfisPorUsuarioId[c.usuario_id]?.avatar_url,
        curtido_pelo_usuario: false,
        usuario_eh_admin: adminsIds.has(c.usuario_id),
        respostas: respostasPorPai[c.id] || [],
        ocultado_por_admin: ocultadoPorAdmin,
        trancado_por_admin: trancadoPorAdmin
      };
    }) as Comentario[];
  }
  
  // Verificar quais comentários o usuário atual curtiu
  const { data: curtidasData, error: curtidasError } = await supabase
    .from('curtidas_comentarios')
    .select('comentario_id')
    .eq('usuario_id', userId);
  
  if (curtidasError) {
    console.error('Erro ao buscar curtidas:', curtidasError);
  }
  
  // Conjunto de IDs de comentários curtidos pelo usuário
  const comentariosCurtidos = new Set(curtidasData?.map(c => c.comentario_id) || []);
  
  // Atualizar as curtidas das respostas
  if (respostasProcessadas.length > 0) {
    respostasProcessadas.forEach(resposta => {
      resposta.curtido_pelo_usuario = comentariosCurtidos.has(resposta.id);
    });
  }
  
  // Retornar comentários com informações adicionais e respostas
  return comentariosData.map(c => {
    const ocultadoPorAdmin = c.ocultado_por ? {
      id: c.ocultado_por,
      nome: perfisPorUsuarioId[c.ocultado_por]?.nome || 'Administrador',
    } : null;
    
    const trancadoPorAdmin = c.trancado_por ? {
      id: c.trancado_por,
      nome: perfisPorUsuarioId[c.trancado_por]?.nome || 'Administrador',
    } : null;
    
    return {
      ...c,
      usuario_nome: perfisPorUsuarioId[c.usuario_id]?.nome || 'Usuário',
      usuario_avatar: perfisPorUsuarioId[c.usuario_id]?.avatar_url,
      curtido_pelo_usuario: comentariosCurtidos.has(c.id),
      usuario_eh_admin: adminsIds.has(c.usuario_id),
      respostas: respostasPorPai[c.id] || [],
      ocultado_por_admin: ocultadoPorAdmin,
      trancado_por_admin: trancadoPorAdmin
    };
  }) as Comentario[];
};
