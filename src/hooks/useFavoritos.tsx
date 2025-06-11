
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Favorito {
  id: string;
  user_id: string;
  item_id: string;
  tipo: 'filme' | 'serie';
  created_at: string;
}

export const useFavoritos = () => {
  const { perfil } = useAuth();
  const queryClient = useQueryClient();

  // Buscar favoritos do usuário
  const { data: favoritos = [], isLoading } = useQuery({
    queryKey: ['favoritos', perfil?.id],
    queryFn: async () => {
      if (!perfil?.id) return [];
      
      const { data, error } = await supabase
        .from('favoritos')
        .select('*')
        .eq('user_id', perfil.id);

      if (error) {
        console.error('Erro ao buscar favoritos:', error);
        toast.error('Erro ao carregar favoritos');
        return [];
      }

      return data as Favorito[];
    },
    enabled: !!perfil?.id,
  });

  // Adicionar aos favoritos
  const adicionarFavorito = useMutation({
    mutationFn: async ({ itemId, tipo }: { itemId: string; tipo: 'filme' | 'serie' }) => {
      if (!perfil?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('favoritos')
        .insert({
          user_id: perfil.id,
          item_id: itemId,
          tipo,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Código de erro de unique constraint
          throw new Error('Item já está nos favoritos');
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoritos'] });
      toast.success('Adicionado aos favoritos');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Remover dos favoritos
  const removerFavorito = useMutation({
    mutationFn: async (itemId: string) => {
      if (!perfil?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('user_id', perfil.id)
        .eq('item_id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoritos'] });
      toast.success('Removido dos favoritos');
    },
    onError: () => {
      toast.error('Erro ao remover dos favoritos');
    },
  });

  return {
    favoritos,
    isLoading,
    adicionarFavorito,
    removerFavorito,
  };
};
