
import SerieVideoPlayer from '@/components/series/SerieVideoPlayer';
import VejaTambemSeries from '@/components/series/VejaTambemSeries';
import { SerieDetalhes, TemporadaDB, EpisodioDB } from '@/services/types/movieTypes';

interface TabAssistirProps {
  serie: SerieDetalhes;
  isTrailer: boolean;
  episodioAtual: EpisodioDB | null;
  temporadaAtual: TemporadaDB | null;
  setIsTrailer: (isTrailer: boolean) => void;
  trocarEpisodio: (id: string) => void;
}

const TabAssistir = ({ 
  serie, 
  isTrailer, 
  episodioAtual, 
  temporadaAtual, 
  setIsTrailer,
  trocarEpisodio 
}: TabAssistirProps) => {
  return (
    <div className="animate-fade-in">
      <SerieVideoPlayer 
        serie={serie}
        isTrailer={isTrailer}
        episodioAtual={episodioAtual}
        temporadaAtual={temporadaAtual}
        setIsTrailer={setIsTrailer}
        trocarEpisodio={trocarEpisodio}
      />
      
      <VejaTambemSeries 
        isLoading={false}
        serieAtualId={serie.id}
      />
    </div>
  );
};

export default TabAssistir;
