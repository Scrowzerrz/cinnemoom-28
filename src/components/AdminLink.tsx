
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

const AdminLink = () => {
  const { ehAdmin, carregando } = useAdmin();
  
  if (carregando || !ehAdmin) return null;
  
  return (
    <Link 
      to="/admin" 
      className="flex items-center gap-1.5 text-white hover:text-red-400 transition-colors"
    >
      <Shield size={16} strokeWidth={2} className="text-movieRed" />
      <span>Admin</span>
    </Link>
  );
};

export default AdminLink;
