
import { Tv, Star, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SerieDB } from '@/services/types/movieTypes';

interface TabelaSeriesProps {
  series: SerieDB[];
  carregando: boolean;
  excluindo: string | null;
  onDelete: (id: string, titulo: string) => Promise<void>;
}

export function TabelaSeries({ series, carregando, excluindo, onDelete }: TabelaSeriesProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-4 font-medium">Série</th>
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
          ) : series.length > 0 ? (
            series.map((serie) => (
              <tr key={serie.id} className="border-b border-gray-800 hover:bg-movieDarkBlue/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Tv className="h-4 w-4 text-movieRed" />
                    <span className="font-medium">{serie.titulo}</span>
                  </div>
                </td>
                <td className="py-3 px-4">{serie.ano}</td>
                <td className="py-3 px-4">
                  {serie.qualidade && (
                    <span className="bg-movieRed px-2 py-0.5 text-xs font-medium rounded-sm">
                      {serie.qualidade}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-movieRed stroke-movieRed" />
                    <span>{serie.avaliacao || '—'}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 bg-green-600/20 hover:bg-green-600/40 text-green-400"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Visualizar</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 bg-red-600/20 hover:bg-red-600/40 text-red-400"
                      onClick={() => onDelete(serie.id, serie.titulo)}
                      disabled={excluindo === serie.id}
                    >
                      {excluindo === serie.id ? (
                        <span className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-4 px-4 text-center text-gray-400">
                Nenhuma série encontrada
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
