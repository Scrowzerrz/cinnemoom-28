
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useAdmin() {
  const { session } = useAuth();
  
  const { data: ehAdmin, isLoading } = useQuery({
    queryKey: ["ehAdmin", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      
      const { data, error } = await supabase.rpc('usuario_atual_eh_admin');
      
      if (error) {
        console.error("Erro ao verificar status de administrador:", error);
        toast.error("Erro ao verificar permissões de administrador");
        return false;
      }
      
      return data === true;
    },
    enabled: !!session?.user?.id,
  });

  return { ehAdmin: !!ehAdmin, carregando: isLoading };
}
