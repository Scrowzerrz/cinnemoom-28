
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CartaoFilme from '@/components/MovieCard';
import { fetchSeries } from '@/services/seriesService';
import { useQuery } from '@tanstack/react-query';
import { MovieCardProps } from '@/components/MovieCard';

interface VejaTambemSeriesProps {
  isLoading: boolean;
  serieAtualId?: string;
}

const VejaTambemSeries = ({ isLoading: isLoadingProp, serieAtualId }: VejaTambemSeriesProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Buscar séries relacionadas
  const { data: seriesRelacionadas = [], isLoading: isQueryLoading } = useQuery({
    queryKey: ['series-semelhantes', serieAtualId],
    queryFn: () => fetchSeries('EM ALTA'),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  console.log('Séries relacionadas:', seriesRelacionadas);

  // Filtrar a série atual da lista de recomendações
  const seriesFiltradas = seriesRelacionadas.filter(serie => 
    !serieAtualId || serie.id !== serieAtualId
  );

  console.log('Séries filtradas (sem a atual):', seriesFiltradas);

  // Embaralhar o array para exibir séries aleatórias
  const seriesAleatorias = [...seriesFiltradas].sort(() => Math.random() - 0.5).slice(0, 10);

  console.log('Séries aleatórias para exibição:', seriesAleatorias);

  // Função para verificar se pode rolar para os lados
  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth);
  };

  // Funções para scrollar para os lados
  const scrollLeft = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    
    el.scrollBy({ left: -el.clientWidth * 0.75, behavior: 'smooth' });
  };

  const scrollRight = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    
    el.scrollBy({ left: el.clientWidth * 0.75, behavior: 'smooth' });
  };

  // Atualizar o estado de scroll quando o componente montar ou o conteúdo mudar
  useEffect(() => {
    checkScrollability();
    
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [seriesAleatorias]);

  const isLoadingFinal = isLoadingProp || isQueryLoading;

  return (
    <div className="mt-10 bg-movieDark/20 p-6 rounded-xl backdrop-blur-sm border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-xl flex items-center">
          <div className="w-1 h-7 bg-movieRed mr-3 rounded-sm"></div>
          <span>VEJA TAMBÉM</span>
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full border-gray-700 bg-black/50 hover:bg-gray-800 disabled:opacity-30"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full border-gray-700 bg-black/50 hover:bg-gray-800 disabled:opacity-30"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-none scroll-smooth snap-x snap-mandatory"
        onScroll={checkScrollability}
      >
        {isLoadingFinal ? (
          Array(6).fill(0).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-[180px] snap-start">
              <div className="group relative rounded-md overflow-hidden">
                <div className="aspect-[2/3] bg-gray-800 animate-pulse rounded-md"></div>
                <div className="h-6 w-3/4 bg-gray-800 animate-pulse mt-2 rounded-md"></div>
                <div className="h-4 w-1/2 bg-gray-800 animate-pulse mt-2 rounded-md"></div>
              </div>
            </div>
          ))
        ) : seriesAleatorias.length > 0 ? (
          seriesAleatorias.map((serie: MovieCardProps) => (
            <div key={serie.id} className="flex-shrink-0 w-[180px] snap-start">
              <CartaoFilme
                id={serie.id}
                title={serie.title}
                posterUrl={serie.posterUrl}
                year={serie.year}
                duration={serie.duration}
                type="series"
                quality={serie.quality}
                rating={serie.rating}
              />
            </div>
          ))
        ) : (
          <div className="w-full py-8 text-center">
            <p className="text-white/60">Nenhuma série semelhante encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VejaTambemSeries;
