
import { supabase } from '@/integrations/supabase/client';
import { TipoItem } from '@/types/comentario.types';

export const adicionarNovoComentario = async (
  texto: string,
  userId: string,
  itemId: string,
  itemTipo: TipoItem,
  comentarioPaiId?: string | null
): Promise<void> => {
  const { error } = await supabase
    .from('comentarios')
    .insert({
      usuario_id: userId,
      item_id: itemId,
      item_tipo: itemTipo,
      texto,
      comentario_pai_id: comentarioPaiId
    });
  
  if (error) {
    console.error('Erro ao adicionar comentário:', error);
    throw new Error('Erro ao adicionar comentário');
  }
};

export const editarComentarioExistente = async (
  id: string,
  texto: string
) => {
  const { data, error } = await supabase
    .from('comentarios')
    .update({ 
      texto,
      data_atualizacao: new Date().toISOString()
    })
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    console.error('Erro ao editar comentário:', error);
    throw new Error('Erro ao editar comentário');
  }
  
  return data;
};

export const excluirComentarioExistente = async (id: string) => {
  const { error } = await supabase
    .from('comentarios')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir comentário:', error);
    throw new Error('Erro ao excluir comentário');
  }
  
  return id;
};

export const alternarVisibilidadeComentario = async (
  id: string,
  visivel: boolean
) => {
  const { data, error } = await supabase
    .from('comentarios')
    .update({ visivel: !visivel })
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    console.error('Erro ao alternar visibilidade:', error);
    throw new Error('Erro ao alternar visibilidade do comentário');
  }
  
  return data;
};

export const alternarCurtidaComentario = async (
  comentarioId: string,
  userId: string,
  curtido: boolean
) => {
  if (curtido) {
    const { error } = await supabase
      .from('curtidas_comentarios')
      .delete()
      .eq('comentario_id', comentarioId)
      .eq('usuario_id', userId);
    
    if (error) {
      console.error('Erro ao remover curtida:', error);
      throw new Error('Erro ao remover curtida');
    }
  } else {
    const { error } = await supabase
      .from('curtidas_comentarios')
      .insert({
        comentario_id: comentarioId,
        usuario_id: userId
      });
    
    if (error) {
      console.error('Erro ao adicionar curtida:', error);
      throw new Error('Erro ao curtir comentário');
    }
  }
  
  return { id: comentarioId, novoEstado: !curtido };
};

export const trancarComentario = async (
  comentarioId: string, 
  userId: string
) => {
  const { error } = await supabase
    .rpc('trancar_comentario', {
      comentario_id: comentarioId,
      trancar: true,
      usuario_admin_id: userId  // Alterado para o novo nome do parâmetro
    });
    
  if (error) {
    console.error('Erro ao trancar comentário:', error);
    throw new Error('Erro ao trancar comentário');
  }
  
  return comentarioId;
};

export const destrancarComentario = async (
  comentarioId: string, 
  userId: string
) => {
  const { error } = await supabase
    .rpc('trancar_comentario', {
      comentario_id: comentarioId,
      trancar: false,
      usuario_admin_id: userId  // Alterado para o novo nome do parâmetro
    });
    
  if (error) {
    console.error('Erro ao destrancar comentário:', error);
    throw new Error('Erro ao destrancar comentário');
  }
  
  return comentarioId;
};
