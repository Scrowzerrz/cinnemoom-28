
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash2, Star, Eye, Tv } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { SerieDB } from '@/services/types/movieTypes';

const GerenciarSeries = () => {
  const [series, setSeries] = useState<SerieDB[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [termo, setTermo] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [excluindo, setExcluindo] = useState<string | null>(null);

  useEffect(() => {
    carregarSeries();
  }, []);

  const carregarSeries = async () => {
    setCarregando(true);
    
    try {
      console.log("Carregando lista de séries...");
      
      let query = supabase
        .from('series')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Erro ao carregar séries:", error);
        throw error;
      }
      
      console.log(`Carregadas ${data?.length || 0} séries com sucesso`);
      setSeries(data || []);
    } catch (erro) {
      console.error("Erro ao carregar séries:", erro);
      toast.error("Erro ao carregar lista de séries");
    } finally {
      setCarregando(false);
    }
  };

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir a série "${titulo}"?`)) {
      return;
    }
    
    try {
      setExcluindo(id);
      console.log(`Iniciando exclusão da série: ${titulo} (ID: ${id})`);
      
      // Verificar se existem temporadas relacionadas à série
      const { data: temporadas, error: erroTemporadas } = await supabase
        .from('temporadas')
        .select('id')
        .eq('serie_id', id);
      
      if (erroTemporadas) {
        console.error("Erro ao verificar temporadas:", erroTemporadas);
        throw erroTemporadas;
      }
      
      if (temporadas && temporadas.length > 0) {
        console.log(`A série possui ${temporadas.length} temporadas que precisam ser excluídas`);
        
        // Para cada temporada, excluir episódios relacionados
        for (const temporada of temporadas) {
          console.log(`Excluindo episódios da temporada ${temporada.id}`);
          
          const { error: erroEpisodios } = await supabase
            .from('episodios')
            .delete()
            .eq('temporada_id', temporada.id);
            
          if (erroEpisodios) {
            console.error(`Erro ao excluir episódios da temporada ${temporada.id}:`, erroEpisodios);
            throw erroEpisodios;
          }
        }
        
        // Excluir temporadas
        console.log("Excluindo todas as temporadas da série");
        const { error: erroExcluirTemporadas } = await supabase
          .from('temporadas')
          .delete()
          .eq('serie_id', id);
        
        if (erroExcluirTemporadas) {
          console.error("Erro ao excluir temporadas:", erroExcluirTemporadas);
          throw erroExcluirTemporadas;
        }
      }
      
      // Verificar e excluir favoritos relacionados
      console.log("Excluindo favoritos relacionados à série");
      const { error: erroFavoritos } = await supabase
        .from('favoritos')
        .delete()
        .eq('item_id', id)
        .eq('tipo', 'serie');
      
      if (erroFavoritos) {
        console.error("Erro ao excluir favoritos:", erroFavoritos);
        toast.error("Erro ao excluir favoritos da série");
        // Não interromper o processo por falha nos favoritos
      }
      
      // Finalmente, excluir a série
      console.log("Excluindo a série");
      const { error } = await supabase
        .from('series')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Erro ao excluir série:", error);
        throw error;
      }
      
      console.log(`Série "${titulo}" excluída com sucesso`);
      setSeries(series.filter(serie => serie.id !== id));
      toast.success(`Série "${titulo}" excluída com sucesso`);
    } catch (erro: any) {
      console.error("Erro completo ao excluir série:", erro);
      toast.error(`Erro ao excluir série: ${erro.message || 'Erro desconhecido'}`);
    } finally {
      setExcluindo(null);
    }
  };

  const seriesFiltradas = series.filter(serie => 
    serie.titulo.toLowerCase().includes(termo.toLowerCase())
  );

  const totalPaginas = Math.ceil(seriesFiltradas.length / itensPorPagina);
  const indiceFinal = paginaAtual * itensPorPagina;
  const indiceInicial = indiceFinal - itensPorPagina;
  const seriesPaginadas = seriesFiltradas.slice(indiceInicial, indiceFinal);

  return (
    <div>
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
              onChange={(e) => setTermo(e.target.value)}
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
      
      <Card className="bg-movieDark border-gray-800 overflow-hidden">
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
              ) : seriesPaginadas.length > 0 ? (
                seriesPaginadas.map((serie) => (
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
                          onClick={() => handleDelete(serie.id, serie.titulo)}
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
        
        {/* Paginação */}
        {seriesFiltradas.length > itensPorPagina && (
          <div className="flex items-center justify-between border-t border-gray-800 p-4">
            <div className="text-sm text-gray-400">
              Mostrando {indiceInicial + 1}-{Math.min(indiceFinal, seriesFiltradas.length)} de {seriesFiltradas.length}
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-700"
                disabled={paginaAtual === 1}
                onClick={() => setPaginaAtual(paginaAtual - 1)}
              >
                Anterior
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-700"
                disabled={paginaAtual === totalPaginas}
                onClick={() => setPaginaAtual(paginaAtual + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default GerenciarSeries;
