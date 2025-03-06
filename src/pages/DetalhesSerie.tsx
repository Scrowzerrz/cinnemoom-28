
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchSerieDetails, incrementarVisualizacaoSerie } from '@/services/seriesService';
import { TabsContent, Tabs } from '@/components/ui/tabs';

import SerieHeader from '@/components/series/SerieHeader';
import SerieLoading from '@/components/series/SerieLoading';
import SerieError from '@/components/series/SerieError';
import SerieFundoBlur from '@/components/series/SerieFundoBlur';
import AbaSerie from '@/components/series/AbaSerie';
import TabAssistir from '@/components/series/TabAssistir';
import TabTemporadas from '@/components/series/TabTemporadas';
import TabSobre from '@/components/series/TabSobre';
import TabComentarios from '@/components/series/TabComentarios';
import { useMobile } from '@/hooks/use-mobile';

const DetalhesSerie = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('temporadas');
  const [temporadaAtiva, setTemporadaAtiva] = useState(1);
  const [episodioAtivo, setEpisodioAtivo] = useState<string | null>(null);
  const [isTrailer, setIsTrailer] = useState(false);
  const isMobile = useMobile();
  
  const { 
    data: serie, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['serie-detalhes', id],
    queryFn: () => fetchSerieDetails(id || ''),
    enabled: !!id,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  useEffect(() => {
    if (id) {
      incrementarVisualizacaoSerie(id).catch(erro => 
        console.error("Erro ao registrar visualização da série:", erro)
      );
    }
  }, [id]);

  // Selecionar o primeiro episódio quando a série é carregada ou a temporada muda
  useEffect(() => {
    if (serie && serie.temporadas.length > 0) {
      const temporadaAtual = serie.temporadas.find(t => t.numero === temporadaAtiva) || serie.temporadas[0];
      
      if (temporadaAtual && temporadaAtual.episodios?.length) {
        console.log(`Selecionando primeiro episódio da temporada ${temporadaAtiva}: ${temporadaAtual.episodios[0].titulo}`);
        setEpisodioAtivo(temporadaAtual.episodios[0].id);
      } else {
        console.log(`A temporada ${temporadaAtiva} não tem episódios`);
        setEpisodioAtivo(null);
      }
    }
  }, [serie, temporadaAtiva]);

  const getTemporadaAtiva = () => {
    if (!serie || !serie.temporadas.length) return null;
    return serie.temporadas.find(t => t.numero === temporadaAtiva) || serie.temporadas[0];
  };

  const getEpisodioAtivo = () => {
    const temporada = getTemporadaAtiva();
    if (!temporada || !temporada.episodios?.length) return null;
    return temporada.episodios.find(e => e.id === episodioAtivo) || temporada.episodios[0];
  };

  const trocarTemporada = (numero: number) => {
    console.log(`Trocando para temporada ${numero}`);
    setTemporadaAtiva(numero);
    // episodioAtivo será definido pelo useEffect
  };

  const trocarEpisodio = (id: string) => {
    console.log(`Trocando para episódio ID: ${id}`);
    setEpisodioAtivo(id);
    setActiveTab('assistir');
    setIsTrailer(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return <SerieLoading />;
  }

  if (error || !serie) {
    return <SerieError onRetry={() => refetch()} />;
  }

  const episodioAtual = getEpisodioAtivo();
  const temporadaAtual = getTemporadaAtiva();

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Área de header com o background da série */}
      <SerieFundoBlur posterUrl={serie.poster_url}>
        <SerieHeader 
          serie={serie} 
          temporadaAtiva={temporadaAtiva} 
          trocarTemporada={trocarTemporada} 
          setActiveTab={setActiveTab} 
          setIsTrailer={setIsTrailer} 
        />
      </SerieFundoBlur>
      
      {/* Conteúdo da página */}
      <div className="container mx-auto px-4 py-4 md:py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <AbaSerie activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="mt-4 md:mt-6">
            <TabsContent value="assistir">
              <TabAssistir 
                serie={serie}
                isTrailer={isTrailer}
                episodioAtual={episodioAtual}
                temporadaAtual={temporadaAtual}
                setIsTrailer={setIsTrailer}
                trocarEpisodio={trocarEpisodio}
              />
            </TabsContent>
            
            <TabsContent value="temporadas">
              <TabTemporadas 
                temporadaAtual={temporadaAtual}
                temporadaAtiva={temporadaAtiva}
                episodioAtivo={episodioAtivo}
                trocarTemporada={trocarTemporada}
                trocarEpisodio={trocarEpisodio}
                totalTemporadas={serie.temporadas.length}
                serieId={serie.id}
              />
            </TabsContent>
            
            <TabsContent value="sobre">
              <TabSobre 
                serie={serie} 
                trocarTemporada={trocarTemporada} 
                setActiveTab={setActiveTab} 
              />
            </TabsContent>
            
            <TabsContent value="comentarios">
              <TabComentarios serieId={serie.id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default DetalhesSerie;
