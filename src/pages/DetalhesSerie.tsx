
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchSerieDetails, incrementarVisualizacaoSerie } from '@/services/movieService';
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

const DetalhesSerie = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('temporadas');
  const [temporadaAtiva, setTemporadaAtiva] = useState(1);
  const [episodioAtivo, setEpisodioAtivo] = useState<string | null>(null);
  const [isTrailer, setIsTrailer] = useState(false);
  
  const { 
    data: serie, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['serie-detalhes', id],
    queryFn: () => fetchSerieDetails(id || ''),
    enabled: !!id
  });

  useEffect(() => {
    if (id) {
      incrementarVisualizacaoSerie(id).catch(erro => 
        console.error("Erro ao registrar visualização da série:", erro)
      );
    }
  }, [id]);

  useEffect(() => {
    if (serie && serie.temporadas.length > 0 && serie.temporadas[0].episodios?.length) {
      setEpisodioAtivo(serie.temporadas[0].episodios[0].id);
    }
  }, [serie]);

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
    setTemporadaAtiva(numero);
    const temporada = serie?.temporadas.find(t => t.numero === numero);
    if (temporada && temporada.episodios?.length) {
      setEpisodioAtivo(temporada.episodios[0].id);
    }
  };

  const trocarEpisodio = (id: string) => {
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
    return <SerieError />;
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
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <AbaSerie activeTab={activeTab} setActiveTab={setActiveTab} />
          
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
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default DetalhesSerie;
