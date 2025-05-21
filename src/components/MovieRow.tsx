
import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Clock, Star, Award, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MovieCard, { MovieCardProps } from './MovieCard';

interface MovieRowProps {
  title: string;
  movies: MovieCardProps[];
  categories?: string[];
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  isLoading?: boolean;
  error?: string;
}

const LinhaFilmes = ({ 
  title, 
  movies, 
  categories, 
  activeCategory, 
  onCategoryChange,
  isLoading = false,
  error
}: MovieRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;
      
      rowRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Função para renderizar o ícone correto para cada categoria
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'EM ALTA':
        return <TrendingUp className="h-4 w-4 mr-1" />;
      case 'RECENTES':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'MAIS VISTOS':
        return <Star className="h-4 w-4 mr-1" />;
      case 'LANÇAMENTOS':
      case 'NOVOS EPISÓDIOS':
        return <Award className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="w-full py-6 relative animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h2 className="section-heading flex items-center text-gradient">
              {title}
            </h2>
            
            {categories && (
              <div className="flex overflow-x-auto hide-scrollbar">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-tab flex items-center ${category === activeCategory ? 'active' : ''}`}
                    onClick={() => onCategoryChange && onCategoryChange(category)}
                  >
                    {getCategoryIcon(category)}
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center h-64 bg-movieDark/20 rounded-lg">
            <Loader2 className="h-10 w-10 text-movieRed animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="w-full py-6 relative animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h2 className="section-heading flex items-center text-gradient">
              {title}
            </h2>
            
            {categories && (
              <div className="flex overflow-x-auto hide-scrollbar">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`category-tab flex items-center ${category === activeCategory ? 'active' : ''}`}
                    onClick={() => onCategoryChange && onCategoryChange(category)}
                  >
                    {getCategoryIcon(category)}
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center h-64 bg-movieDark/20 rounded-lg">
            <div className="text-center">
              <p className="text-white text-xl">{error}</p>
              <p className="text-movieGray mt-2">Por favor, tente novamente mais tarde</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6 relative animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h2 className="section-heading flex items-center text-gradient">
            {title}
          </h2>
          
          {categories && (
            <div className="flex overflow-x-auto hide-scrollbar">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-tab flex items-center ${category === activeCategory ? 'active' : ''}`}
                  onClick={() => onCategoryChange && onCategoryChange(category)}
                >
                  {getCategoryIcon(category)}
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="relative group">
          {/* Left Arrow */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 h-20 w-10 rounded-r-md bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-opacity duration-300 
              ${showLeftArrow ? 'opacity-70 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          
          {/* Movie Cards Container */}
          <div 
            ref={rowRef}
            className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar"
            onScroll={handleScroll}
          >
            {movies.map((movie) => (
              <div key={movie.id} className="flex-none w-[160px] sm:w-[180px] md:w-[200px]">
                <MovieCard {...movie} />
              </div>
            ))}
          </div>
          
          {/* Right Arrow */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 h-20 w-10 rounded-l-md bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-opacity duration-300 
              ${showRightArrow ? 'opacity-70 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LinhaFilmes;
