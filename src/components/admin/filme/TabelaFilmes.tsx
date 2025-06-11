
import { Film, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilmeDB } from '@/services/types/movieTypes';
import { EditarFilmeDialog } from './EditarFilmeDialog';
import { VisualizarFilmeDialog } from './VisualizarFilmeDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TabelaFilmesProps {
  filmes: FilmeDB[];
  carregando: boolean;
  onAtualizarFilmes: () => void;
}

export function TabelaFilmes({ filmes, carregando, onAtualizarFilmes }: TabelaFilmesProps) {
  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir o filme "${titulo}"?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('filmes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      onAtualizarFilmes();
      toast.success(`Filme "${titulo}" excluído com sucesso`);
    } catch (erro) {
      console.error("Erro ao excluir filme:", erro);
      toast.error("Erro ao excluir filme");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-4 font-medium">Filme</th>
            <th className="text-left py-3 px-4 font-medium w-20">Ano</th>
            <th className="text-left py-3 px-4 font-medium w-24">Qualidade</th>
            <th className="text-left py-3 px-4 font-medium w-24">Avaliação</th>
            <th className="text-left py-3 px-4 font-medium w-32">Ações</th>
          </tr>
        </thead>
        <tbody>
          {carregando ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="border-b border-gray-800">
                <td className="py-3 px-4">
                  <div className="h-6 w-full bg-gray-700 animate-pulse rounded"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="h-6 w-12 bg-gray-700 animate-pulse rounded"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="h-6 w-16 bg-gray-700 animate-pulse rounded"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="h-6 w-10 bg-gray-700 animate-pulse rounded"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="h-6 w-20 bg-gray-700 animate-pulse rounded"></div>
                </td>
              </tr>
            ))
          ) : filmes.length > 0 ? (
            filmes.map((filme) => (
              <tr key={filme.id} className="border-b border-gray-800 hover:bg-movieDarkBlue/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-movieRed" />
                    <span className="font-medium">{filme.titulo}</span>
                  </div>
                </td>
                <td className="py-3 px-4">{filme.ano}</td>
                <td className="py-3 px-4">
                  {filme.qualidade && (
                    <span className="bg-movieRed px-2 py-0.5 text-xs font-medium rounded-sm">
                      {filme.qualidade}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-movieRed stroke-movieRed" />
                    <span>{filme.avaliacao || '—'}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <EditarFilmeDialog 
                      filme={filme} 
                      onSuccess={onAtualizarFilmes} 
                    />
                    
                    <VisualizarFilmeDialog filme={filme} />
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 bg-red-600/20 hover:bg-red-600/40 text-red-400"
                      onClick={() => handleDelete(filme.id, filme.titulo)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-4 px-4 text-center text-gray-400">
                Nenhum filme encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
