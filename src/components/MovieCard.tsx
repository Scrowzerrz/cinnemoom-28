
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FavoritoButton from './FavoritoButton';

export interface MovieCardProps {
  id: string;
  title: string;
  posterUrl: string;
  year: string;
  duration?: string;
  type?: 'movie' | 'series';
  quality?: 'HD' | 'CAM' | 'DUB' | 'LEG';
  rating?: string;
}

const CartaoFilme = ({ 
  id,
  title, 
  posterUrl, 
  year, 
  duration, 
  type = 'movie', 
  quality,
  rating = "7.5"
}: MovieCardProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const detailsPath = type === 'series' ? `/serie/${id}` : `/movie/${id}`;

  return (
    <Link to={detailsPath} className="block">
      <div 
        className="group relative w-full aspect-[2/3] rounded-md overflow-hidden transition-transform duration-300 hover:scale-[1.05] hover:z-10 shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-0 bg-movieDark/60 animate-pulse rounded-md">
          <img 
            src={posterUrl} 
            alt={title}
            className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
        
        {quality && (
          <div className="absolute top-2 left-2 z-20">
            <span className="bg-movieRed text-white text-xs font-bold px-2 py-0.5 rounded-sm">{quality}</span>
          </div>
        )}

        <div className="absolute top-2 right-2 z-20">
          <FavoritoButton
            itemId={id}
            tipo={type === 'series' ? 'serie' : 'filme'}
          />
        </div>
        
        <div className="absolute top-2 right-10 z-20 flex items-center bg-black/40 rounded-sm px-1.5 py-0.5">
          <Star className="h-3 w-3 fill-movieRed stroke-movieRed mr-1" />
          <span className="text-white text-xs font-medium">{rating}</span>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-10 opacity-100 transition-opacity duration-300">
          <h3 className="text-white font-semibold line-clamp-1">{title}</h3>
          <div className="flex items-center text-xs text-white/70 mt-1 space-x-1">
            <span>{year}</span>
            {duration && (
              <>
                <span className="mx-1">•</span>
                <span>{duration}</span>
              </>
            )}
          </div>
        </div>
        
        <div className={`absolute inset-0 bg-black/80 flex flex-col justify-between p-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full">
            <Button 
              variant="default" 
              size="sm" 
              className="w-full mb-3 bg-movieRed hover:bg-movieRed/90 text-white font-medium flex items-center justify-center gap-1.5 rounded-sm"
            >
              <Play className="h-4 w-4" strokeWidth={2} /> 
              <span className="ml-1">Assistir</span>
            </Button>
            
            <div className="flex justify-between w-full gap-2">
              <Link to={detailsPath} className="w-full">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full rounded-sm bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                >
                  <Info className="h-4 w-4" strokeWidth={2} />
                  <span className="ml-1">Info</span>
                </Button>
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold text-center mt-2 text-sm line-clamp-2">{title}</h3>
            <div className="flex items-center justify-center text-xs text-white/70 mt-1">
              <span>{year}</span>
              {duration && (
                <>
                  <span className="mx-1">•</span>
                  <span>{duration}</span>
                </>
              )}
            </div>
            <div className="flex items-center justify-center mt-1.5">
              <Star className="h-4 w-4 fill-movieRed stroke-movieRed mr-1" />
              <span className="text-white text-xs font-medium">{rating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CartaoFilme;
