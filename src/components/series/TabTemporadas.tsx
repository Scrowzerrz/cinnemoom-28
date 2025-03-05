
import SerieEpisodesList from '@/components/series/SerieEpisodesList';
import VejaTambemSeries from '@/components/series/VejaTambemSeries';
import { TemporadaDB } from '@/services/types/movieTypes';
import { AlertCircle } from 'lucide-react';

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
  if (totalTemporadas === 0) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6 bg-movieDark/30 p-6 rounded-xl border border-white/5 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-3 text-white">
            <AlertCircle className="text-movieRed h-6 w-6" />
            <p>Nenhuma temporada disponível para esta série. Volte mais tarde.</p>
          </div>
        </div>
        
        <VejaTambemSeries 
          isLoading={false}
          serieAtualId={serieId}
        />
      </div>
    );
  }

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
