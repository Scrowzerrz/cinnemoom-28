
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Calendar, Clock, AlertCircle } from 'lucide-react';
import { TemporadaDB, EpisodioDB } from '@/services/types/movieTypes';

interface SerieEpisodesListProps {
  temporadaAtual: TemporadaDB | null;
  temporadaAtiva: number;
  episodioAtivo: string | null;
  trocarTemporada: (numero: number) => void;
  trocarEpisodio: (id: string) => void;
  totalTemporadas: number;
}

const SerieEpisodesList = ({ 
  temporadaAtual, 
  temporadaAtiva, 
  episodioAtivo,
  trocarTemporada, 
  trocarEpisodio,
  totalTemporadas
}: SerieEpisodesListProps) => {
  return (
    <div className="mb-6 bg-movieDark/30 p-6 rounded-xl border border-white/5 backdrop-blur-sm shadow-lg">
      {/* Cabeçalho da Temporada */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-white text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-movieRed" />
            {temporadaAtual?.titulo || `Temporada ${temporadaAtiva}`}
          </h2>
          <p className="text-movieGray text-sm mt-1 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {temporadaAtual?.episodios?.length || 0} episódios
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="border-white/30 text-white bg-white/10 hover:bg-white/20"
            disabled={temporadaAtiva <= 1}
            onClick={() => trocarTemporada(temporadaAtiva - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="flex items-center px-3 text-white bg-white/5 rounded-md">
            {temporadaAtiva} / {totalTemporadas}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="border-white/30 text-white bg-white/10 hover:bg-white/20"
            disabled={temporadaAtiva >= totalTemporadas}
            onClick={() => trocarTemporada(temporadaAtiva + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Lista de episódios */}
      <div className="grid grid-cols-1 gap-4">
        {temporadaAtual?.episodios && temporadaAtual.episodios.length > 0 ? (
          temporadaAtual.episodios.map((episodio) => (
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
                      src={episodio.thumbnail_url || `https://placehold.co/480x270/1a1a2e/white?text=Episódio+${episodio.numero}`} 
                      alt={episodio.titulo} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/thumbnail:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://placehold.co/480x270/1a1a2e/white?text=Episódio+${episodio.numero}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-movieRed/90 text-white text-xs px-2 py-0.5 rounded-sm font-medium">
                          Ep {episodio.numero}
                        </span>
                        <span className="text-white/80 text-xs">{episodio.duracao || 'Duração não informada'}</span>
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
                          {episodio.duracao || 'Duração não informada'}
                        </span>
                        {episodio.player_url && (
                          <span className="text-green-400 flex items-center gap-1">
                            <Play className="h-3.5 w-3.5" />
                            Disponível
                          </span>
                        )}
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
          ))
        ) : (
          <div className="text-center py-16 bg-movieDark/30 rounded-lg border border-white/5">
            <div className="flex flex-col items-center justify-center gap-3">
              <AlertCircle className="text-movieRed h-10 w-10" />
              <p className="text-white text-xl mb-2">Nenhum episódio disponível</p>
              <p className="text-movieGray">Esta temporada ainda não possui episódios cadastrados.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Navegação entre temporadas */}
      {totalTemporadas > 1 && (
        <div className="flex justify-between mt-8 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            className="border-white/30 text-white bg-white/10 hover:bg-white/20"
            disabled={temporadaAtiva <= 1}
            onClick={() => trocarTemporada(temporadaAtiva - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Temporada anterior
          </Button>
          <Button
            variant="outline"
            className="border-white/30 text-white bg-white/10 hover:bg-white/20"
            disabled={temporadaAtiva >= totalTemporadas}
            onClick={() => trocarTemporada(temporadaAtiva + 1)}
          >
            Próxima temporada <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SerieEpisodesList;
