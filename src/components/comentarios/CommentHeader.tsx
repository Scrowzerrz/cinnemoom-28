
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck, Clock } from 'lucide-react';
import { getInitials, formatarData } from './utils/commentUtils';

interface CommentHeaderProps {
  usuarioNome: string;
  usuarioAvatar?: string;
  dataCriacao: string;
  usuarioEhAdmin: boolean;
  ehAutor: boolean;
}

const CommentHeader = ({
  usuarioNome,
  usuarioAvatar,
  dataCriacao,
  usuarioEhAdmin,
  ehAutor
}: CommentHeaderProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h4 className="text-white font-medium flex items-center">
        {usuarioNome || 'Usuário'}
        
        {usuarioEhAdmin && (
          <Badge className="ml-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 px-2 py-0.5">
            <ShieldCheck className="h-3 w-3" />
            Admin
          </Badge>
        )}
        
        {ehAutor && (
          <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
            Você
          </span>
        )}
      </h4>
      <div className="flex items-center text-gray-400 text-sm">
        <Clock className="h-3 w-3 mr-1" />
        <span>{formatarData(dataCriacao)}</span>
      </div>
    </div>
  );
};

export default CommentHeader;
