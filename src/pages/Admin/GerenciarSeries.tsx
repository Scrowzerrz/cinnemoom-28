
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { SerieDB } from '@/services/types/movieTypes';
import { GerenciarSeriesHeader } from '@/components/admin/serie/GerenciarSeriesHeader';
import { TabelaSeries } from '@/components/admin/serie/TabelaSeries';
import { PaginacaoSeries } from '@/components/admin/serie/PaginacaoSeries';

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
      <GerenciarSeriesHeader 
        termo={termo} 
        onChangeTermo={setTermo} 
      />
      
      <Card className="bg-movieDark border-gray-800 overflow-hidden">
        <TabelaSeries 
          series={seriesPaginadas}
          carregando={carregando}
          excluindo={excluindo}
          onDelete={handleDelete}
        />
        
        {seriesFiltradas.length > itensPorPagina && (
          <PaginacaoSeries
            totalItems={seriesFiltradas.length}
            itensPorPagina={itensPorPagina}
            paginaAtual={paginaAtual}
            onMudarPagina={setPaginaAtual}
          />
        )}
      </Card>
    </div>
  );
};

export default GerenciarSeries;
