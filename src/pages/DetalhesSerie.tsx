
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
import { toast } from 'sonner';

const DetalhesSerie = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('temporadas');
  const [temporadaAtiva, setTemporadaAtiva] = useState(1);
  const [episodioAtivo, setEpisodioAtivo] = useState<string | null>(null);
  const [isTrailer, setIsTrailer] = useState(false);
  
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
    onError: (err) => {
      console.error("Erro ao carregar dados da série:", err);
      toast.error("Não foi possível carregar os dados da série. Tente novamente mais tarde.");
    }
  });

  useEffect(() => {
    if (id) {
      incrementarVisualizacaoSerie(id).catch(erro => 
        console.error("Erro ao registrar visualização da série:", erro)
      );
    }
  }, [id]);

  useEffect(() => {
    if (serie && serie.temporadas.length > 0) {
      // Verificar se há episódios na primeira temporada
      const primeiraTemporada = serie.temporadas[0];
      
      if (primeiraTemporada.episodios && primeiraTemporada.episodios.length > 0) {
        console.log(`Definindo episódio ativo: ${primeiraTemporada.episodios[0].id} (${primeiraTemporada.episodios[0].titulo})`);
        setEpisodioAtivo(primeiraTemporada.episodios[0].id);
      } else {
        console.log(`Primeira temporada não tem episódios disponíveis`);
        setEpisodioAtivo(null);
      }
    } else if (serie) {
      console.log(`Série carregada, mas não tem temporadas: ${serie.titulo}`);
    }
  }, [serie]);

  useEffect(() => {
    if (serie && temporadaAtiva) {
      const temporada = serie.temporadas.find(t => t.numero === temporadaAtiva);
      if (temporada && temporada.episodios && temporada.episodios.length > 0) {
        // Se o episódio ativo não pertence à temporada atual, atualize-o
        const episodioPertenceTemporada = temporada.episodios.some(e => e.id === episodioAtivo);
        if (!episodioPertenceTemporada) {
          console.log(`Atualizando episódio ativo para a temporada ${temporadaAtiva}: ${temporada.episodios[0].id}`);
          setEpisodioAtivo(temporada.episodios[0].id);
        }
      }
    }
  }, [temporadaAtiva, serie, episodioAtivo]);

  const getTemporadaAtiva = () => {
    if (!serie || !serie.temporadas || !serie.temporadas.length) return null;
    return serie.temporadas.find(t => t.numero === temporadaAtiva) || serie.temporadas[0];
  };

  const getEpisodioAtivo = () => {
    const temporada = getTemporadaAtiva();
    if (!temporada || !temporada.episodios || !temporada.episodios.length) return null;
    return temporada.episodios.find(e => e.id === episodioAtivo) || temporada.episodios[0];
  };

  const trocarTemporada = (numero: number) => {
    console.log(`Trocando para temporada ${numero}`);
    setTemporadaAtiva(numero);
    const temporada = serie?.temporadas.find(t => t.numero === numero);
    if (temporada && temporada.episodios && temporada.episodios.length) {
      console.log(`Temporada ${numero} tem ${temporada.episodios.length} episódios. Selecionando primeiro: ${temporada.episodios[0].id}`);
      setEpisodioAtivo(temporada.episodios[0].id);
    } else {
      console.log(`Temporada ${numero} não tem episódios disponíveis`);
      setEpisodioAtivo(null);
    }
  };

  const trocarEpisodio = (id: string) => {
    console.log(`Trocando para episódio ID: ${id}`);
    setEpisodioAtivo(id);
    setActiveTab('assistir');
    setIsTrailer(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const recarregarSerie = () => {
    console.log('Recarregando dados da série...');
    refetch();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return <SerieLoading />;
  }

  if (error || !serie) {
    return <SerieError onRetry={recarregarSerie} />;
  }

  const episodioAtual = getEpisodioAtivo();
  const temporadaAtual = getTemporadaAtiva();
  const totalTemporadas = serie.temporadas?.length || 0;

  console.log(`Renderizando série: ${serie.titulo}`);
  console.log(`Total de temporadas: ${totalTemporadas}`);
  console.log(`Temporada ativa: ${temporadaAtiva}`);
  console.log(`Episódio ativo: ${episodioAtivo}`);

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
              totalTemporadas={totalTemporadas}
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
