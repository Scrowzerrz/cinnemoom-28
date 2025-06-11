
import SerieDetails from '@/components/series/SerieDetails';
import VejaTambemSeries from '@/components/series/VejaTambemSeries';
import { SerieDetalhes } from '@/services/types/movieTypes';

interface TabSobreProps {
  serie: SerieDetalhes;
  trocarTemporada: (numero: number) => void;
  setActiveTab: (tab: string) => void;
}

const TabSobre = ({ serie, trocarTemporada, setActiveTab }: TabSobreProps) => {
  return (
    <div className="animate-fade-in">
      <SerieDetails 
        serie={serie} 
        trocarTemporada={trocarTemporada} 
        setActiveTab={setActiveTab} 
      />
      
      <VejaTambemSeries 
        isLoading={false}
        serieAtualId={serie.id}
      />
    </div>
  );
};

export default TabSobre;
