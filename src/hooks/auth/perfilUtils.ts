
import { supabase } from '@/integrations/supabase/client';
import { PerfilUsuario } from './types';
import { toast } from 'sonner';

export const fetchPerfil = async (userId: string): Promise<PerfilUsuario | null> => {
  if (!userId) {
    console.log("perfilUtils - fetchPerfil: Sem userId, retornando null");
    return null;
  }
  
  try {
    console.log("perfilUtils - fetchPerfil: Buscando perfil para usuário:", userId);
    
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('perfilUtils - fetchPerfil: Erro ao buscar perfil:', error);
      toast.error('Erro ao buscar perfil do usuário');
      return null;
    }

    if (!data) {
      console.warn('perfilUtils - fetchPerfil: Nenhum perfil encontrado para o usuário');
      return null;
    }

    console.log("perfilUtils - fetchPerfil: Perfil obtido com sucesso:", data);
    return data as PerfilUsuario;
  } catch (error) {
    console.error('perfilUtils - fetchPerfil: Exceção ao buscar perfil:', error);
    toast.error('Erro ao buscar perfil do usuário');
    return null;
  }
};
