
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface GerenciarSeriesHeaderProps {
  termo: string;
  onChangeTermo: (valor: string) => void;
}

export function GerenciarSeriesHeader({ termo, onChangeTermo }: GerenciarSeriesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h2 className="text-2xl font-bold">Gerenciar Séries</h2>
      
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Buscar série..."
            className="pl-9 bg-movieDark border-gray-700"
            value={termo}
            onChange={(e) => onChangeTermo(e.target.value)}
          />
        </div>
        
        <Button 
          variant="default" 
          className="bg-movieRed hover:bg-red-700 gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Série</span>
        </Button>
      </div>
    </div>
  );
}
