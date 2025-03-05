
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Calendar, Clock } from 'lucide-react';
import { TemporadaDB, EpisodioDB } from '@/services/types/movieTypes';
import { useState } from 'react';

interface SerieEpisodesListProps {
  temporada: TemporadaDB & { episodios: EpisodioDB[] };
  trocarTemporada?: (numero: number) => void;
}

const SerieEpisodesList = ({ temporada }: SerieEpisodesListProps) => {
  const [episodioAtivo, setEpisodioAtivo] = useState<string | null>(
    temporada?.episodios && temporada.episodios.length > 0 
      ? temporada.episodios[0].id 
      : null
  );

  const trocarEpisodio = (id: string) => {
    setEpisodioAtivo(id);
  };

  return (
    <div className="mb-6 bg-movieDark/30 p-6 rounded-xl border border-white/5 backdrop-blur-sm shadow-lg">
      {/* Cabeçalho da Temporada */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-white text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-movieRed" />
            {temporada?.titulo || `Temporada ${temporada?.numero}`}
          </h2>
          <p className="text-movieGray text-sm mt-1 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {temporada?.episodios?.length || 0} episódios
          </p>
        </div>
      </div>
      
      {/* Lista de episódios */}
      <div className="grid grid-cols-1 gap-4">
        {temporada?.episodios?.map((episodio) => (
          <div 
            key={episodio.id}
            className={`p-4 rounded-lg transition-all cursor-pointer hover:transform hover:scale-[1.01] ${
              episodio.id === episodioAtivo 
                ? 'bg-gradient-to-r from-movieRed/20 to-transparent border border-movieRed/30' 
                : 'bg-movieDark/50 hover:bg-movieDark/80 border border-transparent hover:border-white/10'
            }`}
            onClick={() => trocarEpisodio(episodio.id)}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-48 flex-shrink-0">
                <div className="aspect-video bg-movieDark rounded-md overflow-hidden relative group/thumbnail">
                  <img 
                    src={episodio.thumbnail_url} 
                    alt={episodio.titulo} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/thumbnail:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-movieRed/90 text-white text-xs px-2 py-0.5 rounded-sm font-medium">
                        Ep {episodio.numero}
                      </span>
                      <span className="text-white/80 text-xs">{episodio.duracao}</span>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300 bg-black/40">
                    <div className="bg-movieRed/80 backdrop-blur-sm rounded-full p-3 transform scale-90 group-hover/thumbnail:scale-100 transition-transform">
                      <Play className="h-6 w-6 fill-white text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-medium text-lg">
                      {episodio.numero}. {episodio.titulo}
                    </h3>
                    <div className="flex items-center gap-3 text-movieGray text-sm mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {episodio.duracao}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`border-white/10 ${
                      episodio.id === episodioAtivo 
                        ? 'bg-movieRed text-white hover:bg-movieRed/90' 
                        : 'bg-movieRed/10 hover:bg-movieRed text-white'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      trocarEpisodio(episodio.id);
                    }}
                  >
                    <Play className="h-3 w-3 mr-1 fill-current" /> Assistir
                  </Button>
                </div>
                <p className="text-white/70 text-sm line-clamp-2 mt-2">
                  {episodio.descricao || 'Nenhuma descrição disponível.'}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {(!temporada?.episodios || temporada.episodios.length === 0) && (
          <div className="text-center py-16 bg-movieDark/30 rounded-lg border border-white/5">
            <p className="text-white text-xl mb-2">Nenhum episódio disponível</p>
            <p className="text-movieGray">Esta temporada ainda não possui episódios cadastrados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SerieEpisodesList;
