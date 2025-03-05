
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
    .select(`*`)
    .eq('item_id', itemId)
    .eq('item_tipo', itemTipo)
    .order('data_criacao', { ascending: false });
  
  // Caso não seja admin, mostrar apenas comentários visíveis
  if (!ehAdmin) {
    query = query.eq('visivel', true);
  }
  
  const { data: comentariosData, error: comentariosError } = await query;
  
  if (comentariosError) {
    console.error('Erro ao buscar comentários:', comentariosError);
    throw new Error('Erro ao carregar comentários');
  }

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
  
  // Retornar comentários com informações adicionais
  return comentariosData.map(c => ({
    ...c,
    usuario_nome: perfisPorUsuarioId[c.usuario_id]?.nome || 'Usuário',
    usuario_avatar: perfisPorUsuarioId[c.usuario_id]?.avatar_url,
    curtido_pelo_usuario: comentariosCurtidos.has(c.id),
    usuario_eh_admin: adminsIds.has(c.usuario_id)
  })) as Comentario[];
};
