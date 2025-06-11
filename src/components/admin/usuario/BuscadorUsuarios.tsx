
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface BuscadorUsuariosProps {
  termo: string;
  onChange: (valor: string) => void;
}

export function BuscadorUsuarios({ termo, onChange }: BuscadorUsuariosProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
      
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Buscar usuário..."
            className="pl-9 bg-movieDark border-gray-700"
            value={termo}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
