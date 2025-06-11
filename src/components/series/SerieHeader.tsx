
import { Button } from '@/components/ui/button';
import { Play, Plus, Share2 } from 'lucide-react';
import { Star, Award, Calendar, Clock, Tv } from 'lucide-react';
import { SerieDetalhes } from '@/services/types/movieTypes';
import { toast } from 'sonner';
import FavoritoButton from '@/components/FavoritoButton';
import { useMobile } from '@/hooks/use-mobile';

interface SerieHeaderProps {
  serie: SerieDetalhes;
  temporadaAtiva: number;
  trocarTemporada: (numero: number) => void;
  setActiveTab: (tab: string) => void;
  setIsTrailer: (isTrailer: boolean) => void;
}

const SerieHeader = ({ 
  serie, 
  temporadaAtiva, 
  trocarTemporada, 
  setActiveTab, 
  setIsTrailer 
}: SerieHeaderProps) => {
  const isMobile = useMobile();
  
  // Compartilhar série
  const compartilharSerie = () => {
    if (navigator.share) {
      navigator.share({
        title: serie?.titulo || 'Série',
        text: `Assista ${serie?.titulo} em nossa plataforma de streaming`,
        url: window.location.href
      })
      .catch((err) => {
        console.error('Erro ao compartilhar:', err);
      });
    } else {
      // Fallback para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  // Adicionar à lista
  const adicionarLista = () => {
    toast.success('Série adicionada à sua lista!');
  };

  return (
    <div className="relative pt-8 md:pt-16">
      {/* Background Image com Gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat h-[50vh] md:h-[70vh] z-0"
        style={{ 
          backgroundImage: `url(${serie.poster_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-movieDarkBlue via-movieDarkBlue/95 to-black/30"></div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 pt-8 md:pt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Poster */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0" style={{ maxWidth: isMobile ? '200px' : 'none' }}>
            <div className="rounded-md overflow-hidden shadow-xl border-2 border-movieGray/10">
              <img 
                src={serie.poster_url} 
                alt={serie.titulo} 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          
          {/* Informações da série */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            {/* Título e meta */}
            <div className="mb-4 md:mb-6 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{serie.titulo}</h1>
              {serie.titulo_original && (
                <p className="text-movieGray text-sm md:text-lg mb-2">Título original: {serie.titulo_original}</p>
              )}
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-3 text-xs md:text-sm text-white/70 mt-2">
                <span className="bg-movieRed/90 text-white px-2 py-0.5 rounded-sm text-xs">
                  {serie.idioma || 'DUB'}
                </span>
                <span>{serie.ano}</span>
                <span className="hidden sm:inline">•</span>
                <span>{serie.duracao}</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center">
                  <Star className="h-3 w-3 md:h-4 md:w-4 fill-yellow-500 stroke-yellow-500 mr-1" />
                  {serie.avaliacao}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="bg-movieLightBlue/20 text-white px-2 py-0.5 rounded-sm text-xs">
                  {serie.qualidade || 'HD'}
                </span>
              </div>
            </div>
            
            {/* Gêneros */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4 md:mb-6">
              {serie.generos?.map((genero, index) => (
                <span 
                  key={index} 
                  className="px-2 py-0.5 md:px-3 md:py-1 bg-white/10 text-white/90 rounded-full text-xs md:text-sm"
                >
                  {genero}
                </span>
              ))}
            </div>
            
            {/* Sinopse */}
            <div className="mb-4 md:mb-6 text-center md:text-left">
              <h3 className="text-white font-semibold text-lg md:text-xl mb-2">Sinopse</h3>
              <p className="text-white/80 text-sm md:text-base leading-relaxed">
                {serie.descricao || 'Nenhuma sinopse disponível.'}
              </p>
            </div>
            
            {/* Detalhes técnicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <div>
                <div className="flex items-start gap-2 mb-3">
                  <Tv className="h-4 w-4 md:h-5 md:w-5 text-movieGray mt-0.5" />
                  <div>
                    <h4 className="text-white/80 font-medium text-sm md:text-base">Diretor</h4>
                    <p className="text-white text-sm md:text-base">{serie.diretor || 'Não informado'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 mb-3">
                  <Award className="h-4 w-4 md:h-5 md:w-5 text-movieGray mt-0.5" />
                  <div>
                    <h4 className="text-white/80 font-medium text-sm md:text-base">Elenco</h4>
                    <p className="text-white text-sm md:text-base">{serie.elenco || 'Não informado'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-start gap-2 mb-3">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5 text-movieGray mt-0.5" />
                  <div>
                    <h4 className="text-white/80 font-medium text-sm md:text-base">Produtor</h4>
                    <p className="text-white text-sm md:text-base">{serie.produtor || 'Não informado'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 mb-3">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-movieGray mt-0.5" />
                  <div>
                    <h4 className="text-white/80 font-medium text-sm md:text-base">Ano de Lançamento</h4>
                    <p className="text-white text-sm md:text-base">{serie.ano}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Temporadas disponíveis */}
            <div className="mb-4 md:mb-6 text-center md:text-left">
              <h3 className="text-white font-semibold text-lg md:text-xl mb-2 md:mb-3">Temporadas</h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {serie.temporadas.map((temporada) => (
                  <Button 
                    key={temporada.id}
                    variant={temporada.numero === temporadaAtiva ? "default" : "outline"}
                    size={isMobile ? "sm" : "default"}
                    className={`text-xs md:text-sm ${temporada.numero === temporadaAtiva 
                      ? "bg-movieRed hover:bg-movieRed/90" 
                      : "border-white/30 text-white bg-white/10 hover:bg-white/20"}`}
                    onClick={() => trocarTemporada(temporada.numero)}
                  >
                    Temporada {temporada.numero}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Ações */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 mt-4 md:mt-8">
              <Button 
                className="bg-movieRed hover:bg-movieRed/90 text-white flex items-center gap-1 md:gap-2 rounded-md px-3 md:px-6 py-1 md:py-2 text-xs md:text-sm"
                onClick={() => {
                  setActiveTab('assistir');
                  setIsTrailer(false);
                }}
              >
                <Play className="h-3 w-3 md:h-5 md:w-5 fill-white" /> Assistir Agora
              </Button>
              
              <Button 
                variant="outline" 
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 flex items-center gap-1 md:gap-2 py-1 md:py-2 text-xs md:text-sm"
                onClick={() => {
                  setActiveTab('assistir');
                  setIsTrailer(true);
                }}
              >
                <Play className="h-3 w-3 md:h-5 md:w-5" /> Trailer
              </Button>
              
              <Button 
                variant="outline"
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 w-8 h-8 md:w-10 md:h-10 p-0"
                onClick={adicionarLista}
              >
                <Plus className="h-3 w-3 md:h-5 md:w-5" />
              </Button>
              
              <Button 
                variant="outline"
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 w-8 h-8 md:w-10 md:h-10 p-0"
                onClick={compartilharSerie}
              >
                <Share2 className="h-3 w-3 md:h-5 md:w-5" />
              </Button>
              
              <FavoritoButton
                itemId={serie.id}
                tipo="serie"
                className="border-white/30 bg-white/10 hover:bg-white/20 w-8 h-8 md:w-10 md:h-10 p-0 flex items-center justify-center"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SerieHeader;
