
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAdmin } from './useAdmin';

export interface Comentario {
  id: string;
  usuario_id: string;
  item_id: string;
  item_tipo: 'filme' | 'serie';
  texto: string;
  data_criacao: string;
  data_atualizacao: string;
  visivel: boolean;
  curtidas: number;
  // Campos adicionais que virão com joins
  usuario_nome?: string;
  usuario_avatar?: string;
  curtido_pelo_usuario?: boolean;
}

export const useComentarios = (itemId: string, itemTipo: 'filme' | 'serie') => {
  const { session, perfil } = useAuth();
  const { ehAdmin } = useAdmin();
  const queryClient = useQueryClient();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState<string>('');

  // Buscar comentários
  const { 
    data: comentarios = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['comentarios', itemId, itemTipo],
    queryFn: async () => {
      console.log(`Buscando comentários para ${itemTipo} ${itemId}`);
      
      // Consulta principal para buscar comentários
      let query = supabase
        .from('comentarios')
        .select(`
          *,
          perfis:usuario_id (
            nome,
            avatar_url
          )
        `)
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
      
      // Se não há usuário logado, retornamos os comentários sem verificar curtidas
      if (!session?.user) {
        return comentariosData.map(c => ({
          ...c,
          usuario_nome: c.perfis?.nome || 'Usuário',
          usuario_avatar: c.perfis?.avatar_url,
          curtido_pelo_usuario: false
        }));
      }
      
      // Verificar quais comentários o usuário atual curtiu
      const { data: curtidasData, error: curtidasError } = await supabase
        .from('curtidas_comentarios')
        .select('comentario_id')
        .eq('usuario_id', session.user.id);
      
      if (curtidasError) {
        console.error('Erro ao buscar curtidas:', curtidasError);
        // Continuamos mesmo com erro, apenas sem informações de curtidas
      }
      
      // Conjunto de IDs de comentários curtidos pelo usuário
      const comentariosCurtidos = new Set(
        curtidasData?.map(c => c.comentario_id) || []
      );
      
      // Retornar comentários com informações adicionais
      return comentariosData.map(c => ({
        ...c,
        usuario_nome: c.perfis?.nome || 'Usuário',
        usuario_avatar: c.perfis?.avatar_url,
        curtido_pelo_usuario: comentariosCurtidos.has(c.id)
      }));
    },
    enabled: !!itemId
  });

  // Adicionar comentário
  const adicionarComentario = useMutation({
    mutationFn: async (texto: string) => {
      if (!session?.user) {
        throw new Error('Você precisa estar logado para comentar');
      }
      
      const { data, error } = await supabase
        .from('comentarios')
        .insert({
          usuario_id: session.user.id,
          item_id: itemId,
          item_tipo: itemTipo,
          texto
        })
        .select('*')
        .single();
      
      if (error) {
        console.error('Erro ao adicionar comentário:', error);
        throw new Error('Erro ao adicionar comentário');
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('Comentário adicionado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['comentarios', itemId, itemTipo] });
    },
    onError: (error) => {
      console.error('Erro na mutação de adicionar comentário:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar comentário');
    }
  });

  // Editar comentário
  const editarComentario = useMutation({
    mutationFn: async ({ id, texto }: { id: string; texto: string }) => {
      if (!session?.user) {
        throw new Error('Você precisa estar logado para editar comentários');
      }
      
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
    },
    onSuccess: () => {
      toast.success('Comentário atualizado com sucesso!');
      setEditandoId(null);
      setTextoEdicao('');
      queryClient.invalidateQueries({ queryKey: ['comentarios', itemId, itemTipo] });
    },
    onError: (error) => {
      console.error('Erro na mutação de editar comentário:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao editar comentário');
    }
  });

  // Excluir comentário
  const excluirComentario = useMutation({
    mutationFn: async (id: string) => {
      if (!session?.user) {
        throw new Error('Você precisa estar logado para excluir comentários');
      }
      
      const { error } = await supabase
        .from('comentarios')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao excluir comentário:', error);
        throw new Error('Erro ao excluir comentário');
      }
      
      return id;
    },
    onSuccess: () => {
      toast.success('Comentário excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['comentarios', itemId, itemTipo] });
    },
    onError: (error) => {
      console.error('Erro na mutação de excluir comentário:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir comentário');
    }
  });

  // Alternar visibilidade do comentário (apenas admin)
  const alternarVisibilidade = useMutation({
    mutationFn: async ({ id, visivel }: { id: string; visivel: boolean }) => {
      if (!session?.user || !ehAdmin) {
        throw new Error('Você não tem permissão para realizar esta ação');
      }
      
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
    },
    onSuccess: (data) => {
      const status = data.visivel ? 'exibido' : 'ocultado';
      toast.success(`Comentário ${status} com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['comentarios', itemId, itemTipo] });
    },
    onError: (error) => {
      console.error('Erro na mutação de alternar visibilidade:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao alternar visibilidade');
    }
  });

  // Curtir ou remover curtida de um comentário
  const alternarCurtida = useMutation({
    mutationFn: async ({ id, curtido }: { id: string; curtido: boolean }) => {
      if (!session?.user) {
        throw new Error('Você precisa estar logado para curtir comentários');
      }
      
      if (curtido) {
        // Remover curtida
        const { error } = await supabase
          .from('curtidas_comentarios')
          .delete()
          .eq('comentario_id', id)
          .eq('usuario_id', session.user.id);
        
        if (error) {
          console.error('Erro ao remover curtida:', error);
          throw new Error('Erro ao remover curtida');
        }
      } else {
        // Adicionar curtida
        const { error } = await supabase
          .from('curtidas_comentarios')
          .insert({
            comentario_id: id,
            usuario_id: session.user.id
          });
        
        if (error) {
          console.error('Erro ao adicionar curtida:', error);
          throw new Error('Erro ao curtir comentário');
        }
      }
      
      return { id, novoEstado: !curtido };
    },
    onSuccess: ({ id, novoEstado }) => {
      // Atualizar otimisticamente o estado local
      queryClient.setQueryData(
        ['comentarios', itemId, itemTipo], 
        (old: Comentario[] | undefined) => {
          if (!old) return [];
          return old.map(c => 
            c.id === id 
              ? { 
                  ...c, 
                  curtido_pelo_usuario: novoEstado,
                  curtidas: novoEstado ? c.curtidas + 1 : c.curtidas - 1 
                } 
              : c
          );
        }
      );
    },
    onError: (error) => {
      console.error('Erro na mutação de alternar curtida:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao curtir comentário');
      // Refetch para garantir consistência dos dados
      queryClient.invalidateQueries({ queryKey: ['comentarios', itemId, itemTipo] });
    }
  });

  const iniciarEdicao = (comentario: Comentario) => {
    setEditandoId(comentario.id);
    setTextoEdicao(comentario.texto);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setTextoEdicao('');
  };

  return {
    comentarios,
    isLoading,
    error,
    refetch,
    adicionarComentario,
    editarComentario,
    excluirComentario,
    alternarVisibilidade,
    alternarCurtida,
    editandoId,
    textoEdicao,
    setTextoEdicao,
    iniciarEdicao,
    cancelarEdicao,
    usuarioLogado: !!session?.user,
    perfilUsuario: perfil,
    ehAdmin
  };
};
