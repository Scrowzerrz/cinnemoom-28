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
      comentario_pai_id
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
      comentario_pai_id
    `)
    .in('comentario_pai_id', comentariosData.map(c => c.id))
    .order('data_criacao', { ascending: true });

  if (respostasError) {
    console.error('Erro ao buscar respostas:', respostasError);
    throw new Error('Erro ao carregar respostas');
  }

  // Agrupar respostas por comentário pai
  const respostasPorPai: Record<string, Comentario[]> = {};
  respostasData?.forEach(resposta => {
    if (!respostasPorPai[resposta.comentario_pai_id]) {
      respostasPorPai[resposta.comentario_pai_id] = [];
    }
    respostasPorPai[resposta.comentario_pai_id].push(resposta as Comentario);
  });

  // Buscar informações dos perfis de usuários
  const usuariosIds = comentariosData.map(c => c.usuario_id);
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

  // Se não há usuário logado, retornamos os comentários sem verificar curtidas
  if (!userId) {
    return comentariosData.map(c => ({
      ...c,
      usuario_nome: perfisPorUsuarioId[c.usuario_id]?.nome || 'Usuário',
      usuario_avatar: perfisPorUsuarioId[c.usuario_id]?.avatar_url,
      curtido_pelo_usuario: false,
      usuario_eh_admin: adminsIds.has(c.usuario_id)
    })) as Comentario[];
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
  
  // Retornar comentários com informações adicionais e respostas
  return comentariosData.map(c => ({
    ...c,
    usuario_nome: perfisPorUsuarioId[c.usuario_id]?.nome || 'Usuário',
    usuario_avatar: perfisPorUsuarioId[c.usuario_id]?.avatar_url,
    curtido_pelo_usuario: comentariosCurtidos.has(c.id),
    usuario_eh_admin: adminsIds.has(c.usuario_id),
    respostas: respostasPorPai[c.id] || []
  })) as Comentario[];
};
