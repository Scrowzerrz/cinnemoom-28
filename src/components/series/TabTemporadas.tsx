
import SerieEpisodesList from '@/components/series/SerieEpisodesList';
import VejaTambemSeries from '@/components/series/VejaTambemSeries';
import { TemporadaDB } from '@/services/types/movieTypes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  // Verificando se temos temporadas disponíveis
  const temTemporadas = totalTemporadas > 0;
  
  return (
    <div className="animate-fade-in">
      {!temTemporadas ? (
        <Alert className="bg-movieDark/30 border-movieRed/30 mb-6">
          <AlertTitle className="text-white text-lg">Nenhuma temporada disponível</AlertTitle>
          <AlertDescription className="text-white/70">
            Esta série ainda não possui temporadas cadastradas.
          </AlertDescription>
        </Alert>
      ) : temporadaAtual === null ? (
        <Alert className="bg-movieDark/30 border-amber-500/30 mb-6">
          <AlertTitle className="text-white text-lg flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
            Erro ao carregar temporada
          </AlertTitle>
          <AlertDescription className="text-white/70 mb-3">
            Não foi possível carregar os detalhes da temporada. Por favor, tente novamente.
          </AlertDescription>
          <Button 
            variant="outline" 
            onClick={() => trocarTemporada(temporadaAtiva)}
            className="bg-amber-500/10 border-amber-500/30 text-white hover:bg-amber-500/20"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Tentar novamente
          </Button>
        </Alert>
      ) : (
        <SerieEpisodesList 
          temporadaAtual={temporadaAtual}
          temporadaAtiva={temporadaAtiva}
          episodioAtivo={episodioAtivo}
          trocarTemporada={trocarTemporada}
          trocarEpisodio={trocarEpisodio}
          totalTemporadas={totalTemporadas}
        />
      )}
      
      <VejaTambemSeries 
        isLoading={false}
        serieAtualId={serieId}
      />
    </div>
  );
};

export default TabTemporadas;
