
import { EpisodioDB } from '@/services/types/movieTypes';
import { Play } from 'lucide-react';

interface EpisodioCardProps {
  episodio: EpisodioDB;
  ativo?: boolean;
  onClick?: () => void;
}

export const EpisodioCard = ({ episodio, ativo = false, onClick }: EpisodioCardProps) => {
  return (
    <div 
      className={`p-3 rounded-lg transition-all cursor-pointer ${
        ativo 
          ? 'bg-movieRed/20 border border-movieRed/30' 
          : 'bg-movieDark/50 hover:bg-movieDark/80 border border-transparent'
      }`}
      onClick={onClick}
    >
      <div className="flex gap-4">
        <div className="w-24 sm:w-40 flex-shrink-0">
          <div className="aspect-video bg-movieDark rounded-md overflow-hidden relative">
            <img 
              src={episodio.thumbnail_url} 
              alt={episodio.titulo} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-white font-medium">
              {episodio.numero}. {episodio.titulo}
            </h3>
            <span className="text-movieGray text-sm">{episodio.duracao}</span>
          </div>
          <p className="text-movieGray text-sm line-clamp-2 mt-1">
            {episodio.descricao || 'Nenhuma descrição disponível.'}
          </p>
        </div>
      </div>
    </div>
  );
};
