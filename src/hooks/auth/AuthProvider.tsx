
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { AuthContext } from './AuthContext';
import { PerfilUsuario } from './types';
import { fetchPerfil } from './perfilUtils';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  
  const listenerRef = useRef<{ subscription?: { unsubscribe: () => void } } | null>(null);
  const isMounted = useRef(true);
  const initializationStarted = useRef(false);
  const sessionChecked = useRef(false);
  
  console.log("AuthProvider - Renderização:", { 
    temSessao: !!session, 
    temPerfil: !!perfil, 
    carregando: loading,
    inicializacaoIniciada: initializationStarted.current,
    sessaoVerificada: sessionChecked.current,
    temListener: !!listenerRef.current
  });

  const refreshPerfil = async () => {
    if (!session?.user?.id) {
      console.log("AuthProvider - refreshPerfil: Não é possível atualizar perfil - nenhuma sessão ativa");
      return;
    }
    
    console.log("AuthProvider - refreshPerfil: Atualizando perfil para usuário:", session.user.id);
    const userProfile = await fetchPerfil(session.user.id);
    
    if (userProfile && isMounted.current) {
      console.log("AuthProvider - refreshPerfil: Perfil atualizado com sucesso");
      setPerfil(userProfile);
    } else {
      console.log("AuthProvider - refreshPerfil: Falha ao atualizar perfil ou componente desmontado");
    }
  };

  // Verificação inicial da sessão - executada uma única vez
  useEffect(() => {
    if (initializationStarted.current) {
      console.log("AuthProvider - Inicialização já iniciada, ignorando");
      return;
    }

    const inicializar = async () => {
      console.log("AuthProvider - Iniciando inicialização");
      initializationStarted.current = true;
      
      try {
        console.log("AuthProvider - Obtendo sessão atual do navegador");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthProvider - Erro ao obter sessão:", error);
          if (isMounted.current) {
            setLoading(false);
            sessionChecked.current = true;
          }
          return;
        }
        
        console.log("AuthProvider - Sessão obtida:", currentSession ? "Autenticado" : "Não autenticado");
        
        if (isMounted.current) {
          setSession(currentSession);
          sessionChecked.current = true;
          
          if (currentSession?.user) {
            console.log("AuthProvider - Sessão encontrada, buscando perfil");
            const userProfile = await fetchPerfil(currentSession.user.id);
            if (isMounted.current && userProfile) {
              console.log("AuthProvider - Definindo perfil após obtenção de sessão");
              setPerfil(userProfile);
            }
          }
          
          // Marcar carregamento como concluído APÓS todas as operações
          if (isMounted.current) {
            console.log("AuthProvider - Inicialização completa, definindo loading=false");
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("AuthProvider - Erro durante inicialização:", error);
        if (isMounted.current) {
          setLoading(false);
          sessionChecked.current = true;
        }
      }
    };
    
    inicializar();
  }, []);

  // Configura o listener de alteração de estado de autenticação (após sessionChecked)
  useEffect(() => {
    if (!sessionChecked.current) {
      console.log("AuthProvider - Aguardando verificação de sessão antes de configurar listener");
      return;
    }
    
    if (listenerRef.current) {
      console.log("AuthProvider - Listener já configurado, ignorando");
      return;
    }
    
    console.log("AuthProvider - Configurando listener de autenticação");
    const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('AuthProvider - Estado de autenticação alterado:', event, newSession?.user?.email);
      
      if (!isMounted.current) {
        console.log('AuthProvider - Componente desmontado, ignorando evento de auth');
        return;
      }
      
      // Para qualquer evento, atualize a sessão
      setSession(newSession);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('AuthProvider - Usuário logado ou token atualizado');
        
        if (newSession?.user) {
          console.log('AuthProvider - Buscando perfil após login');
          setLoading(true); // Mostrar loading durante busca de perfil
          
          const userProfile = await fetchPerfil(newSession.user.id);
          if (isMounted.current) {
            if (userProfile) {
              console.log('AuthProvider - Perfil obtido após login');
              setPerfil(userProfile);
            } else {
              console.log('AuthProvider - Nenhum perfil encontrado após login');
            }
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('AuthProvider - Usuário deslogado, limpando dados');
        setPerfil(null);
        setLoading(false);
      } else {
        // Para outros eventos, apenas atualize o estado de loading
        setLoading(false);
      }
    });

    listenerRef.current = data;
    
    return () => {
      console.log("AuthProvider - Limpando efeito de listener");
      isMounted.current = false;
      if (listenerRef.current?.subscription) {
        console.log("AuthProvider - Removendo listener de autenticação");
        listenerRef.current.subscription.unsubscribe();
        listenerRef.current = null;
      }
    };
  }, [sessionChecked.current]);

  const signOut = async () => {
    try {
      console.log("AuthProvider - Iniciando processo de logout");
      setLoading(true);
      await supabase.auth.signOut();
      console.log("AuthProvider - Logout realizado com sucesso");
      setSession(null);
      setPerfil(null);
      navigate('/auth');
    } catch (error) {
      console.error('AuthProvider - Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ session, perfil, loading, signOut, refreshPerfil }}>
      {children}
    </AuthContext.Provider>
  );
};
