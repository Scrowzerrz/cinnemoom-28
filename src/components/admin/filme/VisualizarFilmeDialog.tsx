
import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FilmeDB } from "@/services/types/movieTypes";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface VisualizarFilmeDialogProps {
  filme: FilmeDB;
}

export function VisualizarFilmeDialog({ filme }: VisualizarFilmeDialogProps) {
  const [open, setOpen] = useState(false);

  // Função para extrair URL do iframe
  const extrairUrlIframe = (url: string): string => {
    if (!url) return '';
    
    // Verificar se a URL é um iframe
    if (url.includes('iframe') && url.includes('src=')) {
      const matches = url.match(/src=["'](.*?)["']/);
      if (matches && matches[1]) {
        return matches[1];
      }
    }
    
    // Caso contrário, retornar a URL como está
    return url;
  };
  
  // Verifica se a URL é de vídeo direto
  const isDirectVideo = (url: string): boolean => {
    return url && (url.endsWith('.mp4') || url.includes('download') || url.includes('pixeldrain.com'));
  };

  const trailerUrl = filme.trailer_url;
  const playerUrl = filme.player_url;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 bg-green-600/20 hover:bg-green-600/40 text-green-400"
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">Visualizar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-950 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-white pb-4 flex items-center gap-2">
            <span className="bg-movieRed/20 text-movieRed p-1 rounded">
              <Eye className="h-5 w-5" />
            </span>
            {filme.titulo} <span className="text-gray-400">({filme.ano})</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <AspectRatio ratio={2/3} className="rounded-md overflow-hidden bg-gray-900 border border-gray-800">
              <img 
                src={filme.poster_url} 
                alt={filme.titulo} 
                className="object-cover w-full h-full"
              />
            </AspectRatio>
            
            <div className="flex flex-wrap gap-2">
              {filme.generos?.map((genero, index) => (
                <Badge key={index} variant="outline" className="bg-gray-900 text-gray-300 border-gray-700">{genero}</Badge>
              ))}
              
              {filme.qualidade && (
                <Badge variant="outline" className="bg-movieRed/10 text-movieRed border-movieRed/30">
                  {filme.qualidade}
                </Badge>
              )}
              
              {filme.destaque && (
                <Badge variant="outline" className="bg-yellow-600/10 text-yellow-500 border-yellow-600/30">
                  Destaque
                </Badge>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-300 text-sm">Duração</h3>
                <p className="text-white">{filme.duracao}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-300 text-sm">Avaliação</h3>
                <p className="text-white">{filme.avaliacao}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-300 text-sm">Idioma</h3>
                <p className="text-white">{filme.idioma}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-300 text-sm">Categoria</h3>
                <p className="text-white">{filme.categoria}</p>
              </div>
            </div>
            
            <div className="space-y-2 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
              <h3 className="font-semibold text-gray-300 text-sm">Sinopse</h3>
              <p className="text-white">{filme.descricao}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <h3 className="font-semibold text-gray-300 text-sm">Diretor</h3>
                <p className="text-white">{filme.diretor}</p>
              </div>
              
              {filme.produtor && (
                <div className="space-y-2 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                  <h3 className="font-semibold text-gray-300 text-sm">Produtor</h3>
                  <p className="text-white">{filme.produtor}</p>
                </div>
              )}
              
              <div className="space-y-2 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <h3 className="font-semibold text-gray-300 text-sm">Elenco</h3>
                <p className="text-white">{filme.elenco}</p>
              </div>
            </div>
          </div>
        </div>
        
        {trailerUrl && (
          <div className="mt-6 space-y-2 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
            <h3 className="font-semibold text-white">Trailer</h3>
            <AspectRatio ratio={16/9} className="bg-black rounded-md overflow-hidden">
              {isDirectVideo(trailerUrl) ? (
                <video src={trailerUrl} controls className="w-full h-full" />
              ) : (
                <iframe
                  src={extrairUrlIframe(trailerUrl)}
                  allowFullScreen
                  className="w-full h-full"
                  title={`Trailer de ${filme.titulo}`}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
              )}
            </AspectRatio>
          </div>
        )}
        
        {playerUrl && (
          <div className="mt-6 space-y-2 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
            <h3 className="font-semibold text-white">Player</h3>
            <AspectRatio ratio={16/9} className="bg-black rounded-md overflow-hidden">
              {isDirectVideo(playerUrl) ? (
                <video src={playerUrl} controls className="w-full h-full" />
              ) : (
                <iframe
                  src={extrairUrlIframe(playerUrl)}
                  allowFullScreen
                  className="w-full h-full"
                  title={`Player de ${filme.titulo}`}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
              )}
            </AspectRatio>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
