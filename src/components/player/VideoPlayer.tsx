
import { useEffect, useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VideoPlayerProps {
  playerUrl: string;
  posterUrl: string;
  title: string;
}

const VideoPlayer = ({ playerUrl, posterUrl, title }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const iniciarPlayer = () => {
    setIsLoading(true);
    setIsPlaying(true);
    setTimeout(() => setIsLoading(false), 500); // Simulate brief loading
  };

  // Função para processar a URL do player
  const getPlayerUrl = (url: string): string => {
    try {
      // Verifica se é uma URL válida
      new URL(url);
      
      // Verifica se é um iframe (contém src= dentro do texto)
      if (url.includes('iframe') && url.includes('src=')) {
        // Extrai a URL entre aspas após src=
        const matches = url.match(/src=["'](.*?)["']/);
        if (matches && matches[1]) {
          return matches[1];
        }
      }
      
      // Se não for um iframe, retorna a URL como está
      return url;
    } catch (error) {
      console.error("URL inválida:", error);
      toast.error("URL do player inválida");
      return "";
    }
  };

  // Limpa a URL para ser seguramente incorporada
  const getSafeUrl = (url: string): string => {
    try {
      const processedUrl = getPlayerUrl(url);
      // Verificar se a URL é válida
      new URL(processedUrl);
      return processedUrl;
    } catch (error) {
      console.error("URL inválida:", error);
      toast.error("URL do player inválida");
      return "";
    }
  };

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black group">
      {!isPlaying ? (
        <div className="absolute inset-0 z-10 overflow-hidden">
          {/* Poster com efeito de desfoque */}
          <div 
            className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 scale-105 group-hover:scale-110" 
            style={{ 
              backgroundImage: `url(${posterUrl})`,
              filter: 'blur(2px)'
            }}
          />
          
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-black/50 bg-gradient-to-t from-black via-black/70 to-transparent z-10" />
          
          {/* Conteúdo */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <h3 className="text-white text-2xl font-bold mb-6 text-center px-6 drop-shadow-lg">{title}</h3>
            
            <Button 
              onClick={iniciarPlayer}
              className="bg-movieRed hover:bg-movieRed/90 text-white flex items-center gap-2 rounded-full p-8 shadow-lg transform transition-transform duration-300 hover:scale-110"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-10 w-10 animate-spin" />
              ) : (
                <Play className="h-10 w-10 fill-white" />
              )}
            </Button>
            
            <p className="text-white/80 mt-6 text-sm">Clique para assistir</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-black">
          {getSafeUrl(playerUrl).endsWith('.mp4') || 
           getSafeUrl(playerUrl).includes('download') || 
           getSafeUrl(playerUrl).includes('pixeldrain.com') ? (
            // Se for um mp4 direto ou link de download, usar o elemento video
            <video
              src={getSafeUrl(playerUrl)}
              className="w-full h-full"
              controls
              autoPlay
              poster={posterUrl}
            />
          ) : (
            // Caso contrário, usar iframe
            <iframe
              src={getSafeUrl(playerUrl)}
              title={title}
              className="w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            ></iframe>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
