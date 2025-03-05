
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useAdmin } from './useAdmin';
import { Comentario } from '@/types/comentario.types';
import { buscarComentarios } from '@/services/comentariosService';
import {
  adicionarNovoComentario,
  editarComentarioExistente,
  excluirComentarioExistente,
  alternarVisibilidadeComentario,
  alternarCurtidaComentario,
  trancarComentario,
  destrancarComentario
} from '@/services/mutacoesComentarios';

export { type Comentario };

// Define a type for the adicionarComentario parameters
interface AdicionarComentarioParams {
  texto: string;
  comentarioPaiId?: string | null;
}

export const useComentarios = (itemId: string, itemTipo: 'filme' | 'serie') => {
  const { session, perfil } = useAuth();
  const { ehAdmin } = useAdmin();
  const queryClient = useQueryClient();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState<string>('');
  const [comentarioRespondendoId, setComentarioRespondendoId] = useState<string | null>(null);

  // Buscar comentários
  const { 
    data: comentarios = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['comentarios', itemId, itemTipo],
    queryFn: () => buscarComentarios(itemId, itemTipo, ehAdmin, session?.user?.id),
    enabled: !!itemId
  });

  // Adicionar comentário (agora com suporte a respostas)
  const adicionarComentario = useMutation({
    mutationFn: async (params: AdicionarComentarioParams) => {
      if (!session?.user) {
        throw new Error('Você precisa estar logado para comentar');
      }
      await adicionarNovoComentario(
        params.texto, 
        session.user.id, 
        itemId, 
        itemTipo, 
        params.comentarioPaiId
      );
    },
    onSuccess: () => {
      toast.success('Comentário adicionado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['comentarios', itemId, itemTipo] });
      setComentarioRespondendoId(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar comentário');
    }
  });

  // Editar comentário
  const editarComentario = useMutation({
    mutationFn: async ({ id, texto }: { id: string; texto: string }) => {
      if (!session?.user) {
        throw new Error('Você precisa estar logado para editar comentários');
      }
      return editarComentarioExistente(id, texto);
    },
    onSuccess: () => {
      toast.success('Comentário atualizado com sucesso!');
      setEditandoId(null);
      setTextoEdicao('');
      queryClient.invalidateQueries({ queryKey: ['comentarios', itemId, itemTipo] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao editar comentário');
    }
  });

  // Excluir comentário
  const excluirComentario = useMutation({
    mutationFn: async (id: string) => {
      if (!session?.user) {
        throw new Error('Você precisa estar logado para excluir comentários');
      }
      return excluirComentarioExistente(id);
    },
    onSuccess: () => {
      toast.success('Comentário excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['comentarios', itemId, itemTipo] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir comentário');
    }
  });

  // Alternar visibilidade
  const alternarVisibilidade = useMutation({
    mutationFn: async ({ id, visivel }: { id: string; visivel: boolean }) => {
      if (!session?.user || !ehAdmin) {
        throw new Error('Você não tem permissão para realizar esta ação');
      }
      return alternarVisibilidadeComentario(id, visivel);
    },
    onSuccess: (data) => {
      const status = data.visivel ? 'exibido' : 'ocultado';
      toast.success(`Comentário ${status} com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['comentarios', itemId, itemTipo] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao alternar visibilidade');
    }
  });

  // Curtir ou remover curtida
  const alternarCurtida = useMutation({
    mutationFn: async ({ id, curtido }: { id: string; curtido: boolean }) => {
      if (!session?.user) {
        throw new Error('Você precisa estar logado para curtir comentários');
      }
      return alternarCurtidaComentario(id, session.user.id, curtido);
    },
    onSuccess: ({ id, novoEstado }) => {
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
      toast.error(error instanceof Error ? error.message : 'Erro ao curtir comentário');
      queryClient.invalidateQueries({ queryKey: ['comentarios', itemId, itemTipo] });
    }
  });

  // Trancar comentário
  const trancar = useMutation({
    mutationFn: async (id: string) => {
      if (!session?.user || !ehAdmin) {
        throw new Error('Você não tem permissão para realizar esta ação');
      }
      return trancarComentario(id, session.user.id);
    },
    onSuccess: (id) => {
      toast.success('Comentário trancado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['comentarios', itemId, itemTipo] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao trancar comentário');
    }
  });

  // Destrancar comentário
  const destrancar = useMutation({
    mutationFn: async (id: string) => {
      if (!session?.user || !ehAdmin) {
        throw new Error('Você não tem permissão para realizar esta ação');
      }
      return destrancarComentario(id, session.user.id);
    },
    onSuccess: (id) => {
      toast.success('Comentário destrancado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['comentarios', itemId, itemTipo] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao destrancar comentário');
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

  const iniciarResposta = (comentario: Comentario | null) => {
    setComentarioRespondendoId(comentario?.id || null);
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
    trancar,
    destrancar,
    editandoId,
    textoEdicao,
    setTextoEdicao,
    iniciarEdicao,
    cancelarEdicao,
    usuarioLogado: !!session?.user,
    perfilUsuario: perfil,
    ehAdmin,
    comentarioRespondendoId,
    iniciarResposta
  };
};
