
import { Button } from '@/components/ui/button';
import { Share2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { MovieResponse } from '@/services/types/movieTypes';
import VideoPlayer from '@/components/player/VideoPlayer';
import { useFavoritos } from '@/hooks/useFavoritos';

interface FilmeAssistirProps {
  filme: MovieResponse;
  isTrailer: boolean;
  setIsTrailer: (isTrailer: boolean) => void;
  handleFavoritoClick: () => void;
  isFavorito: boolean;
}

const FilmeAssistir = ({ filme, isTrailer, setIsTrailer, handleFavoritoClick, isFavorito }: FilmeAssistirProps) => {
  const compartilharFilme = () => {
    if (navigator.share) {
      navigator.share({
        title: filme?.titulo || 'Filme',
        text: `Assista ${filme?.titulo} em nossa plataforma de streaming`,
        url: window.location.href
      })
      .catch((err) => {
        console.error('Erro ao compartilhar:', err);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-semibold">
          {isTrailer ? 'Trailer Oficial' : 'Assistir Filme'}
        </h2>
        
        <div className="flex gap-3">
          <Button 
            variant={isTrailer ? "outline" : "default"} 
            size="sm" 
            className={isTrailer ? "border-gray-700 text-white bg-black hover:bg-gray-800" : "bg-movieRed hover:bg-movieRed/90"}
            onClick={() => setIsTrailer(false)}
          >
            Filme
          </Button>
          
          <Button 
            variant={!isTrailer ? "outline" : "default"} 
            size="sm" 
            className={!isTrailer ? "border-gray-700 text-white bg-black hover:bg-gray-800" : "bg-movieRed hover:bg-movieRed/90"}
            onClick={() => setIsTrailer(true)}
          >
            Trailer
          </Button>
        </div>
      </div>
      
      <div className="w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-8 shadow-2xl">
        {isTrailer ? (
          <iframe
            src={filme.trailer_url}
            title={`Trailer: ${filme.titulo}`}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        ) : (
          <VideoPlayer 
            playerUrl={filme.player_url} 
            posterUrl={filme.poster_url} 
            title={filme.titulo} 
          />
        )}
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
        <h3 className="text-white text-lg font-bold mb-3">{filme.titulo}</h3>
        <p className="text-gray-400 mb-4">{filme.descricao}</p>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="border-gray-700 text-white bg-black/50 hover:bg-gray-800"
            onClick={compartilharFilme}
          >
            <Share2 className="mr-2 h-4 w-4" /> Compartilhar
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            className="border-gray-700 text-white bg-black/50 hover:bg-gray-800"
            onClick={handleFavoritoClick}
          >
            <Plus className="mr-2 h-4 w-4" /> {isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          </Button>
        </div>
      </div>
    </>
  );
};

export default FilmeAssistir;
