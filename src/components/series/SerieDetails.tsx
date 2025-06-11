
import { SerieDetalhes } from '@/services/types/movieTypes';

interface SerieDetailsProps {
  serie: SerieDetalhes;
  trocarTemporada: (numero: number) => void;
  setActiveTab: (tab: string) => void;
}

const SerieDetails = ({ serie }: SerieDetailsProps) => {
  return (
    <div className="bg-movieDark/30 p-6 rounded-lg backdrop-blur-sm border border-white/5">
      <h2 className="text-white text-2xl font-semibold mb-4">Sinopse</h2>
      
      <p className="text-white/80 leading-relaxed">
        {serie.descricao || 'Nenhuma sinopse disponível.'}
      </p>
    </div>
  );
};

export default SerieDetails;
