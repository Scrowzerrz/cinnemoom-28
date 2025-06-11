
import { supabase } from '@/integrations/supabase/client';
import { TipoItem } from '@/types/comentario.types';

export const adicionarNovoComentario = async (
  texto: string,
  userId: string,
  itemId: string,
  itemTipo: TipoItem,
  comentarioPaiId?: string | null
): Promise<void> => {
  // Primeiro, verificar o comentário com a IA moderadora
  try {
    const { data: moderationData, error: moderationError } = await supabase.functions.invoke(
      'moderate-comment', 
      { body: { commentText: texto } }
    );
    
    if (moderationError) {
      console.error('Erro ao moderar comentário:', moderationError);
      // Continua permitindo o comentário, mas registra o erro
    }
    
    // Se o comentário for considerado inapropriado, adiciona o motivo como metadados
    // e marca como não visível para moderação manual
    const visivel = moderationData?.isAppropriate !== false;
    const metadata = !visivel ? { moderationReason: moderationData.reason } : null;
    const ocultadoAutomaticamente = !visivel;

    const { error } = await supabase
      .from('comentarios')
      .insert({
        usuario_id: userId,
        item_id: itemId,
        item_tipo: itemTipo,
        texto,
        comentario_pai_id: comentarioPaiId,
        visivel,
        metadata,
        ocultado_automaticamente: ocultadoAutomaticamente,
        data_ocultacao: ocultadoAutomaticamente ? new Date().toISOString() : null
      });
    
    if (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw new Error('Erro ao adicionar comentário');
    }

    // Se o comentário foi automáticamente bloqueado, retornar essa informação
    if (!visivel) {
      throw new Error(`Comentário bloqueado: ${moderationData.reason}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Comentário bloqueado:')) {
      throw error;
    }
    console.error('Erro na moderação ou adição de comentário:', error);
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
  visivel: boolean,
  adminId: string
) => {
  const agora = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('comentarios')
    .update({ 
      visivel: !visivel,
      ocultado_por: !visivel ? null : adminId,
      data_ocultacao: !visivel ? null : agora
    })
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
  try {
    // Se estiver removendo a curtida
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
    } 
    // Se estiver adicionando uma curtida
    else {
      // Primeiro, obtenha informações do comentário para saber quem é o autor
      const { data: comentario, error: comentarioError } = await supabase
        .from('comentarios')
        .select('usuario_id, item_id, item_tipo')
        .eq('id', comentarioId)
        .single();
      
      if (comentarioError) {
        console.error('Erro ao obter informações do comentário:', comentarioError);
        throw new Error('Erro ao curtir comentário');
      }

      // Adicionar a curtida
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

      // Se o autor do comentário não for o próprio usuário que está curtindo,
      // envia notificação para o autor do comentário
      if (comentario.usuario_id !== userId) {
        try {
          // Buscar informações do usuário que curtiu para incluir na notificação
          const { data: perfilUsuario } = await supabase
            .from('perfis')
            .select('nome')
            .eq('id', userId)
            .single();
          
          const nomeUsuario = perfilUsuario?.nome || 'Alguém';
          
          console.log('Enviando notificação de curtida para:', comentario.usuario_id);
          
          // Criar notificação para o autor do comentário
          const { data: notificacaoData, error: notificacaoError } = await supabase
            .from('notificacoes')
            .insert({
              user_id: comentario.usuario_id,
              titulo: 'Novo like em seu comentário',
              mensagem: `${nomeUsuario} curtiu seu comentário`,
              tipo: 'novo_like',
              item_id: comentario.item_id,
              item_tipo: comentario.item_tipo,
              lida: false
            })
            .select();
          
          if (notificacaoError) {
            console.error('Erro ao criar notificação de curtida:', notificacaoError);
            // Não falhar a operação por causa da notificação
          } else {
            console.log('Notificação de curtida criada com sucesso:', notificacaoData);
          }
        } catch (notifError) {
          console.error('Erro ao processar notificação:', notifError);
          // Não falhar a operação por causa da notificação
        }
      }
    }
    
    return { id: comentarioId, novoEstado: !curtido };
  } catch (error) {
    console.error('Erro ao processar curtida:', error);
    throw error;
  }
};

export const trancarComentario = async (
  comentarioId: string, 
  userId: string
) => {
  const { error } = await supabase
    .rpc('trancar_comentario', {
      comentario_id: comentarioId,
      trancar: true,
      usuario_admin_id: userId
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
      usuario_admin_id: userId
    });
    
  if (error) {
    console.error('Erro ao destrancar comentário:', error);
    throw new Error('Erro ao destrancar comentário');
  }
  
  return comentarioId;
};
