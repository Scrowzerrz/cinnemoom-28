import { Film, Star, Trash2, Eye, Edit, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FilmeDB } from '@/services/types/movieTypes';
import { EditarFilmeDialog } from './EditarFilmeDialog';
import { VisualizarFilmeDialog } from './VisualizarFilmeDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useMobile } from '@/hooks/use-mobile';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

interface TabelaFilmesProps {
  filmes: FilmeDB[];
  carregando: boolean;
  onAtualizarFilmes: () => void;
}

export function TabelaFilmes({ filmes, carregando, onAtualizarFilmes }: TabelaFilmesProps) {
  const isMobile = useMobile();

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

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="bg-movieDark border-gray-800">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48 bg-gray-700" />
                <Skeleton className="h-4 w-32 bg-gray-700" />
              </div>
              <Skeleton className="h-8 w-20 bg-gray-700" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Mobile Card Layout
  const MobileLayout = () => (
    <div className="space-y-4">
      {filmes.map((filme) => (
        <Card key={filme.id} className="bg-movieDark border-gray-800 hover:border-gray-700 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-movieRed" />
                <CardTitle className="text-base">{filme.titulo}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <VisualizarFilmeDialog filme={filme}>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </div>
                    </VisualizarFilmeDialog>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <EditarFilmeDialog filme={filme} onSuccess={onAtualizarFilmes}>
                      <div className="flex items-center">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </div>
                    </EditarFilmeDialog>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(filme.id, filme.titulo)}
                    className="text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Ano:</span>
                <p className="font-medium">{filme.ano}</p>
              </div>
              <div>
                <span className="text-gray-400">Qualidade:</span>
                <div className="mt-1">
                  {filme.qualidade ? (
                    <Badge variant="default" className="bg-movieRed text-white">
                      {filme.qualidade}
                    </Badge>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Avaliação:</span>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-movieRed stroke-movieRed" />
                  <span className="font-medium">{filme.avaliacao || '—'}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400">Gêneros:</span>
                <p className="font-medium">{filme.generos || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Desktop Table Layout
  const DesktopLayout = () => (
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
          {filmes.map((filme) => (
            <tr key={filme.id} className="border-b border-gray-800 hover:bg-movieDarkBlue/50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-movieRed" />
                  <span className="font-medium">{filme.titulo}</span>
                </div>
              </td>
              <td className="py-3 px-4">{filme.ano}</td>
              <td className="py-3 px-4">
                {filme.qualidade ? (
                  <Badge variant="default" className="bg-movieRed text-white">
                    {filme.qualidade}
                  </Badge>
                ) : (
                  <span className="text-gray-500">—</span>
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
                  <VisualizarFilmeDialog filme={filme} />
                  <EditarFilmeDialog 
                    filme={filme} 
                    onSuccess={onAtualizarFilmes}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
                    onClick={() => handleDelete(filme.id, filme.titulo)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {filmes.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 px-4 text-center text-gray-400">
                Nenhum filme encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  if (carregando) {
    return <LoadingSkeleton />;
  }

  if (filmes.length === 0) {
    return (
      <Card className="bg-movieDark border-gray-800">
        <CardContent className="p-8 text-center">
          <Film className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Nenhum filme encontrado</h3>
          <p className="text-gray-400">Adicione filmes ao catálogo para vê-los aqui.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </div>
  );
}