
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';

interface RotaProtegidaProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const RotaProtegida = ({ children, redirectTo = '/auth' }: RotaProtegidaProps) => {
  const { session, loading } = useAuth();
  const [timeoutAtingido, setTimeoutAtingido] = useState(false);
  const tentativasRef = useRef(0);
  const maxTentativas = 5;

  // Log inicial do componente
  console.log('RotaProtegida - Renderizando componente:', { 
    temSessao: !!session, 
    carregando: loading,
    tempoLimiteAtingido: timeoutAtingido,
    tentativas: tentativasRef.current 
  });

  // Timeout para evitar loading infinito - 600ms
  useEffect(() => {
    let timeout: number | undefined;
    
    if (loading) {
      console.log(`RotaProtegida - Iniciando timer de timeout (600ms), tentativa: ${tentativasRef.current + 1}`);
      timeout = window.setTimeout(() => {
        tentativasRef.current += 1;
        console.log(`RotaProtegida - Tempo limite atingido, tentativa: ${tentativasRef.current}/${maxTentativas}`);
        
        if (tentativasRef.current >= maxTentativas) {
          console.log('RotaProtegida - Número máximo de tentativas atingido, desistindo');
          setTimeoutAtingido(true);
        } else {
          // Forçar re-renderização para tentar novamente
          setTimeoutAtingido(prev => !prev);
        }
      }, 600);
    } else {
      console.log('RotaProtegida - Loading completado, resetando timeout e contadores');
      tentativasRef.current = 0;
      setTimeoutAtingido(false);
    }
    
    return () => {
      if (timeout) {
        console.log('RotaProtegida - Limpando timeout anterior');
        window.clearTimeout(timeout);
      }
    };
  }, [loading, timeoutAtingido]);

  // Verificações de emergência - se tudo falhar após várias tentativas
  if (tentativasRef.current >= maxTentativas) {
    console.log('RotaProtegida - EMERGÊNCIA: Carregamento falhou após múltiplas tentativas');
    
    if (!session) {
      console.log('RotaProtegida - EMERGÊNCIA: Redirecionando para autenticação');
      return <Navigate to={redirectTo} replace />;
    } else {
      console.log('RotaProtegida - EMERGÊNCIA: Mostrando conteúdo protegido mesmo com loading incompleto');
      return <>{children}</>;
    }
  }

  // Lógica simplificada para decisão final
  if (!loading) {
    if (!session) {
      console.log('RotaProtegida - Sem sessão, redirecionando para', redirectTo);
      return <Navigate to={redirectTo} replace />;
    }
    
    console.log('RotaProtegida - Sessão presente, mostrando conteúdo protegido');
    return <>{children}</>;
  }

  // Se ainda está carregando e não atingiu timeout
  console.log('RotaProtegida - Mostrando indicador de carregamento');
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-movieDarkBlue z-50">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-movieRed animate-spin mx-auto mb-4" />
        <p className="text-white">Verificando autenticação... ({tentativasRef.current}/{maxTentativas})</p>
        <p className="text-xs text-gray-400 mt-2">Aguarde ou recarregue a página se demorar muito</p>
      </div>
    </div>
  );
};

export default RotaProtegida;
