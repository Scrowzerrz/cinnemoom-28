
import SerieEpisodesList from '@/components/series/SerieEpisodesList';
import VejaTambemSeries from '@/components/series/VejaTambemSeries';
import { TemporadaDB } from '@/services/types/movieTypes';

interface TabTemporadasProps {
  temporadaAtual: TemporadaDB | null;
  temporadaAtiva: number;
  episodioAtivo: string | null;
  trocarTemporada: (numero: number) => void;
  trocarEpisodio: (id: string) => void;
  totalTemporadas: number;
  serieId: string;
}

const TabTemporadas = ({
  temporadaAtual,
  temporadaAtiva,
  episodioAtivo,
  trocarTemporada,
  trocarEpisodio,
  totalTemporadas,
  serieId
}: TabTemporadasProps) => {
  return (
    <div className="animate-fade-in">
      <SerieEpisodesList 
        temporadaAtual={temporadaAtual}
        temporadaAtiva={temporadaAtiva}
        episodioAtivo={episodioAtivo}
        trocarTemporada={trocarTemporada}
        trocarEpisodio={trocarEpisodio}
        totalTemporadas={totalTemporadas}
      />
      
      <VejaTambemSeries 
        isLoading={false}
        serieAtualId={serieId}
      />
    </div>
  );
};

export default TabTemporadas;
