import { useState, useEffect } from 'react';
import { Play, Info, Star, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import FavoritoButton from '@/components/FavoritoButton';

interface HeroItem {
  id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  type?: 'movie' | 'series';
  rating?: string;
  year?: string;
  duration?: string;
}

interface HeroCarouselProps {
  items: HeroItem[];
}

const HeroCarousel = ({ items }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const navigate = useNavigate();

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Manual navigation
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-[90vh] bg-movieDarkBlue">
        <p className="text-white text-2xl">Nenhum conteúdo disponível</p>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  // Funções para navegar para as páginas
  const irParaDetalhes = () => {
    if (!currentItem.id) return;
    
    if (currentItem.type === 'movie') {
      navigate(`/movie/${currentItem.id}`);
    } else {
      navigate(`/serie/${currentItem.id}`);
    }
  };

  const assistir = () => {
    if (!currentItem.id) return;
    
    if (currentItem.type === 'movie') {
      navigate(`/movie/${currentItem.id}?tab=assistir`);
    } else {
      navigate(`/serie/${currentItem.id}?tab=assistir`);
    }
  };

  return (
    <div 
      className="relative w-full h-[90vh] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Images */}
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${item.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent"></div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Hero Content */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center z-10">
        <div className="max-w-2xl animate-fade-in opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          {/* Enhanced Tag */}
          <div className="mb-4 flex items-center">
            <span className="bg-movieRed px-3 py-1 text-sm font-semibold text-white rounded-sm mr-3">
              {currentItem.type === 'series' ? 'SÉRIE' : 'FILME'}
            </span>
            <div className="flex items-center space-x-4 text-white/90">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-movieRed stroke-movieRed mr-1" />
                <span className="text-sm font-medium">{currentItem.rating}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-white/70" />
                <span className="text-sm">{currentItem.year}</span>
              </div>
              {currentItem.duration && (
                <div className="text-sm text-white/70">
                  {currentItem.duration}
                </div>
              )}
            </div>
          </div>
          
          {/* Title with text shadow */}
          <h1 
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-none" 
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            key={currentItem.id} // Key para forçar re-render na mudança
          >
            {currentItem.title}
          </h1>
          
          {/* Description */}
          {currentItem.description && (
            <p 
              className="text-white/90 text-lg mb-8 line-clamp-3 max-w-xl"
              key={`desc-${currentItem.id}`} // Key para forçar re-render na mudança
            >
              {currentItem.description}
            </p>
          )}
          
          {/* Buttons with enhanced styling */}
          <div className="flex flex-wrap gap-4">
            <Button 
              className="bg-white text-black hover:bg-white/90 flex gap-2 items-center rounded-sm px-8 py-6 text-base font-semibold transition-transform duration-300 hover:scale-105"
              onClick={assistir}
            >
              <Play className="h-5 w-5 fill-black" /> Assistir
            </Button>
            <Button 
              variant="outline" 
              className="border-white/30 text-white bg-black/30 backdrop-blur-sm hover:bg-black/50 flex gap-2 items-center rounded-sm px-8 py-6 text-base font-semibold transition-transform duration-300 hover:scale-105"
              onClick={irParaDetalhes}
            >
              <Info className="h-5 w-5" /> Mais Informações
            </Button>
            {currentItem.id && (
              <FavoritoButton
                itemId={currentItem.id}
                tipo={currentItem.type === 'movie' ? 'filme' : 'serie'}
                className="border-white/30 bg-black/30 backdrop-blur-sm hover:bg-black/50 flex gap-2 items-center rounded-sm w-12 h-[56px] text-base font-semibold transition-transform duration-300 hover:scale-105"
              />
            )}
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      {items.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-movieRed' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {items.length > 1 && isAutoPlaying && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
          <div 
            className="h-full bg-movieRed transition-all duration-100 ease-linear"
            style={{
              width: `${((currentIndex + 1) / items.length) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;