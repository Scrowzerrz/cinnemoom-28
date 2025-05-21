
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface RotaAdminProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ADMIN_REAUTH_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const ADMIN_REAUTH_TIMESTAMP_KEY = 'adminReAuthTimestamp';

const RotaAdmin = ({ children, redirectTo = '/' }: RotaAdminProps) => {
  const location = useLocation(); // Add this
  const { session, loading: authLoading } = useAuth();
  const { ehAdmin, carregando: adminLoading } = useAdmin();
  
  const carregando = authLoading || adminLoading;

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
  if (!carregando && !session) {
    return <Navigate to="/auth" replace />;
  }

  if (!carregando && !ehAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  // ---> START NEW RE-AUTH LOGIC <---
  const adminReAuthTimestamp = sessionStorage.getItem(ADMIN_REAUTH_TIMESTAMP_KEY);
  const needsReAuth = !adminReAuthTimestamp || (Date.now() - parseInt(adminReAuthTimestamp)) > ADMIN_REAUTH_TIMEOUT_MS;

  if (needsReAuth) {
    // Construct the redirect URL carefully, preserving existing search params if any
    const redirectUrl = location.pathname + location.search;
    return <Navigate to={`/admin-reauth?redirect=${encodeURIComponent(redirectUrl)}`} replace />;
  }
  // ---> END NEW RE-AUTH LOGIC <---

  return <>{children}</>;
};

export default RotaAdmin;
