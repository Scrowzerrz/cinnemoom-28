
import { Button } from '@/components/ui/button';
import { Play, Info, AlertCircle } from 'lucide-react';
import { SerieDetalhes, TemporadaDB, EpisodioDB } from '@/services/types/movieTypes';
import VideoPlayer from '@/components/player/VideoPlayer';

interface SerieVideoPlayerProps {
  serie: SerieDetalhes;
  isTrailer: boolean;
  episodioAtual: EpisodioDB | null;
  temporadaAtual: TemporadaDB | null;
  setIsTrailer: (isTrailer: boolean) => void;
  trocarEpisodio: (id: string) => void;
}

const SerieVideoPlayer = ({ 
  serie, 
  isTrailer,
  episodioAtual,
  temporadaAtual,
  setIsTrailer,
  trocarEpisodio
}: SerieVideoPlayerProps) => {
  const getPlayerUrl = (url: string): string => {
    if (!url) return "";
    
    try {
      new URL(url);
      
      if (url.includes('iframe') && url.includes('src=')) {
        const matches = url.match(/src=["'](.*?)["']/);
        if (matches && matches[1]) {
          return matches[1];
        }
      }
      
      return url;
    } catch (error) {
      console.error("URL inválida:", error);
      return "";
    }
  };

  // Verificar se há episódios disponíveis
  const temEpisodiosDisponiveis = 
    temporadaAtual && 
    temporadaAtual.episodios && 
    temporadaAtual.episodios.length > 0;

  return (
    <div className="mt-6">
      <div className="w-full mb-8 rounded-xl overflow-hidden shadow-2xl">
        {isTrailer ? (
          serie.trailer_url ? (
            <div className="aspect-video bg-black/40 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
              
              <iframe
                src={getPlayerUrl(serie.trailer_url)}
                title={`Trailer: ${serie.titulo}`}
                className="w-full h-full z-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              ></iframe>
            </div>
          ) : (
            <div className="aspect-video bg-movieDark flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="h-12 w-12 text-movieRed mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">Trailer não disponível</h3>
              <p className="text-white/70 mb-4">Esta série não possui trailer cadastrado.</p>
              {temEpisodiosDisponiveis && (
                <Button onClick={() => setIsTrailer(false)} className="bg-movieRed hover:bg-movieRed/90">
                  <Play className="mr-2 h-4 w-4 fill-white" /> Ver episódios
                </Button>
              )}
            </div>
          )
        ) : episodioAtual && episodioAtual.player_url ? (
          <VideoPlayer 
            playerUrl={episodioAtual.player_url} 
            posterUrl={episodioAtual.thumbnail_url || serie.poster_url} 
            title={`${serie.titulo} - ${episodioAtual.titulo}`} 
          />
        ) : episodioAtual && !episodioAtual.player_url ? (
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${episodioAtual.thumbnail_url || serie.poster_url})` }}
            />
            
            <div className="absolute inset-0 bg-black/70 bg-gradient-to-t from-black via-black/80 to-black/50" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center max-w-lg px-6">
                <AlertCircle className="h-12 w-12 text-movieRed mx-auto mb-4" />
                <h3 className="text-white text-xl font-semibold mb-2">
                  Player indisponível para este episódio
                </h3>
                <p className="text-white/70 mb-4">
                  O episódio "{episodioAtual.titulo}" ainda não possui player configurado.
                  Por favor, tente outro episódio ou volte mais tarde.
                </p>
                
                {serie.trailer_url && (
                  <Button 
                    onClick={() => setIsTrailer(true)}
                    className="bg-movieRed hover:bg-movieRed/90"
                  >
                    <Play className="mr-2 h-4 w-4 fill-white" /> Assistir trailer
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${serie.poster_url})` }}
            />
            
            <div className="absolute inset-0 bg-black/70 bg-gradient-to-t from-black via-black/80 to-black/50" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center max-w-lg px-6">
                {temEpisodiosDisponiveis ? (
                  <>
                    <h3 className="text-white text-xl font-semibold mb-3">Comece a assistir {serie.titulo}</h3>
                    <p className="text-white/70 mb-6">Selecione um episódio para começar a assistir esta incrível série</p>
                    
                    <Button 
                      onClick={() => trocarEpisodio(temporadaAtual.episodios[0].id)}
                      className="bg-movieRed hover:bg-movieRed/90"
                    >
                      <Play className="mr-2 h-4 w-4 fill-white" /> Assistir primeiro episódio
                    </Button>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 text-movieRed mx-auto mb-4" />
                    <h3 className="text-white text-xl font-semibold mb-2">
                      Episódios indisponíveis
                    </h3>
                    <p className="text-white/70 mb-4">
                      Esta série ainda não possui episódios disponíveis.
                      {serie.trailer_url ? " Você pode assistir ao trailer enquanto isso." : ""}
                    </p>
                    
                    {serie.trailer_url && (
                      <Button 
                        onClick={() => setIsTrailer(true)}
                        className="bg-movieRed hover:bg-movieRed/90"
                      >
                        <Play className="mr-2 h-4 w-4 fill-white" /> Assistir trailer
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-white text-2xl font-bold">
            {isTrailer ? 'Trailer Oficial' : (episodioAtual ? episodioAtual.titulo : 'Selecione um episódio')}
          </h2>
          {!isTrailer && episodioAtual && (
            <p className="text-movieGray text-sm mt-1">{temporadaAtual?.titulo} • Episódio {episodioAtual.numero} • {episodioAtual.duracao || 'Duração não informada'}</p>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant={isTrailer ? "outline" : "default"} 
            size="sm" 
            disabled={!temEpisodiosDisponiveis}
            className={isTrailer ? "border-white/30 text-white bg-white/10 hover:bg-white/20" : "bg-movieRed hover:bg-movieRed/90"}
            onClick={() => setIsTrailer(false)}
          >
            <Play className={`h-4 w-4 mr-1.5 ${!isTrailer ? "fill-white" : ""}`} /> Episódio
          </Button>
          
          <Button 
            variant={!isTrailer ? "outline" : "default"} 
            size="sm" 
            disabled={!serie.trailer_url}
            className={!isTrailer ? "border-white/30 text-white bg-white/10 hover:bg-white/20" : "bg-movieRed hover:bg-movieRed/90"}
            onClick={() => setIsTrailer(true)}
          >
            <Play className={`h-4 w-4 mr-1.5 ${isTrailer ? "fill-white" : ""}`} /> Trailer
          </Button>
        </div>
      </div>

      {episodioAtual && !isTrailer && (
        <div className="bg-movieDark/30 border border-white/5 p-6 rounded-lg mb-8 backdrop-blur-sm shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
          <div className="flex items-start gap-3">
            <Info className="text-movieGray h-5 w-5 mt-1 flex-shrink-0" />
            <p className="text-white/80 leading-relaxed">{episodioAtual.descricao || 'Nenhuma descrição disponível para este episódio.'}</p>
          </div>
        </div>
      )}

      {temporadaAtual?.episodios && temporadaAtual.episodios.length > 0 && (
        <div className="mt-8">
          <h3 className="text-white font-bold text-xl mb-5 flex items-center after:content-[''] after:ml-4 after:h-[1px] after:flex-1 after:bg-white/10">Mais episódios</h3>
          <div className="flex gap-4 mb-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
            {temporadaAtual.episodios.map((ep) => (
              <div 
                key={ep.id}
                className={`flex-shrink-0 w-64 cursor-pointer transition-all snap-start ${ep.id === episodioAtual?.id ? 'ring-2 ring-movieRed scale-[1.02]' : 'opacity-80 hover:opacity-100'}`}
                onClick={() => trocarEpisodio(ep.id)}
              >
                <div className="aspect-video bg-movieDark rounded-md overflow-hidden relative group">
                  <img 
                    src={ep.thumbnail_url || `https://placehold.co/480x270/1a1a2e/white?text=Episódio+${ep.numero}`} 
                    alt={ep.titulo} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://placehold.co/480x270/1a1a2e/white?text=Episódio+${ep.numero}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-movieRed/90 text-white text-xs px-2 py-0.5 rounded-sm font-medium">
                        Ep {ep.numero}
                      </span>
                      <span className="text-white/80 text-xs">{ep.duracao || 'Duração não informada'}</span>
                    </div>
                    <h4 className="text-white text-sm font-medium mt-2 line-clamp-2">{ep.titulo}</h4>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <Play className="h-6 w-6 fill-white" />
                    </div>
                  </div>
                  
                  {ep.player_url && (
                    <div className="absolute top-2 right-2 bg-green-500/80 rounded-full p-1" title="Player disponível">
                      <Play className="h-3 w-3 fill-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SerieVideoPlayer;
