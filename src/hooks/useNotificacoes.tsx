
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Notificacao {
  id: string;
  user_id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  created_at: string;
  item_id: string;
  item_tipo: string;
}

export const useNotificacoes = () => {
  const { perfil } = useAuth();
  const queryClient = useQueryClient();

  // Buscar notificações do usuário
  const { data: notificacoes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['notificacoes', perfil?.id],
    queryFn: async () => {
      if (!perfil?.id) return [];
      
      console.log('Buscando notificações para o usuário:', perfil.id);
      
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', perfil.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar notificações:', error);
        toast.error('Erro ao carregar notificações');
        return [];
      }

      console.log('Notificações encontradas:', data);
      return data as Notificacao[];
    },
    enabled: !!perfil?.id,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    refetchOnWindowFocus: true, // Atualiza quando a janela recebe foco
  });

  // Marcar notificação como lida
  const marcarComoLida = useMutation({
    mutationFn: async (notificacaoId: string) => {
      if (!perfil?.id) throw new Error('Usuário não autenticado');

      console.log('Marcando notificação como lida:', notificacaoId);
      
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', notificacaoId)
        .eq('user_id', perfil.id);

      if (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        throw error;
      }
      
      console.log('Notificação marcada como lida com sucesso');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes', perfil?.id] });
    },
    onError: (error) => {
      console.error('Erro na mutação de marcar como lida:', error);
      toast.error('Erro ao atualizar notificação');
    },
  });

  // Marcar todas notificações como lidas
  const marcarTodasComoLidas = useMutation({
    mutationFn: async () => {
      if (!perfil?.id) throw new Error('Usuário não autenticado');
      
      console.log('Marcando todas as notificações como lidas');
      
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('user_id', perfil.id)
        .eq('lida', false);

      if (error) {
        console.error('Erro ao marcar todas as notificações como lidas:', error);
        throw error;
      }
      
      console.log('Todas as notificações marcadas como lidas com sucesso');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes', perfil?.id] });
      toast.success('Todas as notificações foram marcadas como lidas');
    },
    onError: (error) => {
      console.error('Erro na mutação de marcar todas como lidas:', error);
      toast.error('Erro ao atualizar notificações');
    },
  });

  // Contar notificações não lidas
  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return {
    notificacoes,
    isLoading,
    error,
    refetch,
    marcarComoLida,
    marcarTodasComoLidas,
    naoLidas,
  };
};
