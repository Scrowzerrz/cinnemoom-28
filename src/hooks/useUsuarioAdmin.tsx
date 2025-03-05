
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { useAuth } from './useAuth';

interface Usuario {
  id: string;
  nome: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
  eh_admin: boolean;
}

export function useUsuarioAdmin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const { perfil } = useAuth();
  
  const carregarUsuarios = async () => {
    setCarregando(true);
    
    try {
      console.log("Carregando usuários do sistema...");
      
      // Certificar que a tabela perfis está habilitada com RLS
      const { data: perfis, error: erroPerf } = await supabase
        .from('perfis')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (erroPerf) {
        console.error("Erro ao buscar perfis:", erroPerf);
        toast.error("Erro ao buscar perfis: " + erroPerf.message);
        throw erroPerf;
      }
      
      console.log(`Encontrados ${perfis?.length || 0} perfis de usuários:`, perfis);
      
      if (!perfis || perfis.length === 0) {
        setUsuarios([]);
        setCarregando(false);
        return;
      }
      
      // Buscar papel de admin para cada usuário
      const usuariosComPapel = await Promise.all(
        perfis.map(async (perfil) => {
          try {
            // Verificar se o usuário tem papel de admin usando RPC
            const { data: ehAdmin, error: erroAdmin } = await supabase
              .rpc('tem_papel', { 
                usuario_id: perfil.id, 
                tipo_papel_param: 'admin' 
              });
            
            if (erroAdmin) {
              console.error(`Erro ao verificar papel admin para usuário ${perfil.id}:`, erroAdmin);
              return {
                ...perfil,
                eh_admin: false
              };
            }
            
            return {
              ...perfil,
              eh_admin: ehAdmin || false
            };
          } catch (erro) {
            console.error(`Erro ao processar usuário ${perfil.id}:`, erro);
            return {
              ...perfil,
              eh_admin: false
            };
          }
        })
      );
      
      console.log(`Processados ${usuariosComPapel.length} usuários com seus papéis:`, usuariosComPapel);
      setUsuarios(usuariosComPapel);
    } catch (erro) {
      console.error("Erro ao carregar usuários:", erro);
      toast.error("Erro ao carregar lista de usuários");
    } finally {
      setCarregando(false);
    }
  };
  
  const alternarAdmin = async (usuario: Usuario) => {
    try {
      setCarregando(true);
      
      if (usuario.eh_admin) {
        // Remover papel de admin
        const { error } = await supabase
          .from('papeis_usuario')
          .delete()
          .eq('user_id', usuario.id)
          .eq('papel', 'admin');
        
        if (error) throw error;
        
        toast.success(`Permissões de admin removidas para ${usuario.nome || usuario.email}`);
      } else {
        // Adicionar papel de admin
        const { error } = await supabase
          .from('papeis_usuario')
          .insert({
            user_id: usuario.id,
            papel: 'admin'
          });
        
        if (error) throw error;
        
        // Enviar notificação para o usuário que foi promovido a admin
        if (perfil) {
          console.log(`Enviando notificação para novo admin ${usuario.id} por ${perfil.nome || perfil.email}`);
          
          const notificacaoData = {
            user_id: usuario.id,
            titulo: 'Você é um Administrador Agora!',
            mensagem: `${perfil.nome || perfil.email} concedeu a você permissões de administrador. Agora você pode acessar o painel administrativo e gerenciar usuários, filmes e séries.`,
            tipo: 'admin_promocao',
            item_id: usuario.id,
            item_tipo: 'perfil'
          };
          
          console.log('Dados da notificação:', notificacaoData);
          
          const { data, error: erroNotif } = await supabase
            .from('notificacoes')
            .insert(notificacaoData)
            .select();
          
          if (erroNotif) {
            console.error("Erro ao enviar notificação:", erroNotif);
            toast.error(`Erro ao enviar notificação: ${erroNotif.message}`);
          } else {
            console.log("Notificação enviada com sucesso:", data);
            toast.success("Notificação enviada ao novo administrador");
          }
        }
        
        toast.success(`Permissões de admin concedidas para ${usuario.nome || usuario.email}`);
      }
      
      // Atualizar lista de usuários
      await carregarUsuarios();
    } catch (erro) {
      console.error("Erro ao alterar permissões:", erro);
      toast.error("Erro ao alterar permissões de administrador");
    } finally {
      setCarregando(false);
    }
  };

  // Não carregamos os usuários automaticamente mais, pois estamos usando o useEffect em GerenciarUsuarios
  
  return {
    usuarios,
    carregando,
    carregarUsuarios,
    alternarAdmin
  };
}
