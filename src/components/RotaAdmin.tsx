
import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface RotaAdminProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const RotaAdmin = ({ children, redirectTo = '/' }: RotaAdminProps) => {
  const { session, loading: authLoading } = useAuth();
  const { ehAdmin, carregando: adminLoading } = useAdmin();
  
  const carregando = authLoading || adminLoading;

  // Redirecionar para autenticação se não estiver logado
  if (!carregando && !session) {
    return <Navigate to="/auth" replace />;
  }

  // Redirecionar para página principal se não for admin
  if (!carregando && !ehAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  // Mostrar indicador de carregamento
  if (carregando) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-movieDarkBlue z-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-movieRed animate-spin mx-auto mb-4" />
          <p className="text-white">Verificando permissões de administrador...</p>
        </div>
      </div>
    );
  }

  // Renderizar o conteúdo para admins
  return <>{children}</>;
};

export default RotaAdmin;
