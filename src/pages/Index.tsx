
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import LinhaFilmes from '@/components/MovieRow';
import Footer from '@/components/Footer';
import { fetchMovies, fetchSeries, fetchHeroMovie } from '@/services/movieService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const categoriesFilmes = ['LANÇAMENTOS', 'RECENTES', 'MAIS VISTOS', 'EM ALTA'];
const categoriesSeries = ['NOVOS EPISÓDIOS', 'RECENTES', 'MAIS VISTOS', 'EM ALTA'];

const Index = () => {
  const [activeCategoryFilmes, setActiveCategoryFilmes] = useState(categoriesFilmes[0]);
  const [activeCategorySeries, setActiveCategorySeries] = useState(categoriesSeries[0]);

  // Fetch hero movie data
  const { 
    data: heroMovie, 
    isLoading: heroLoading, 
    error: heroError,
    refetch: refetchHero
  } = useQuery({
    queryKey: ['heroMovie'],
    queryFn: fetchHeroMovie,
    retry: 1,
    meta: {
      onError: (error) => {
        console.error('Erro ao carregar destaque:', error);
        toast.error('Erro ao carregar destaque. Tentando novamente...');
        // Podemos tentar novamente após um tempo
        setTimeout(() => refetchHero(), 3000);
      }
    }
  });

  // Fetch movies based on active category
  const { 
    data: movies, 
    isLoading: moviesLoading, 
    error: moviesError,
    refetch: refetchMovies
  } = useQuery({
    queryKey: ['movies', activeCategoryFilmes],
    queryFn: () => fetchMovies(activeCategoryFilmes)
  });

  // Fetch series based on active series category
  const { 
    data: series, 
    isLoading: seriesLoading, 
    error: seriesError,
    refetch: refetchSeries
  } = useQuery({
    queryKey: ['series', activeCategorySeries],
    queryFn: () => fetchSeries(activeCategorySeries)
  });

  // Trigger refetch when category changes
  useEffect(() => {
    refetchMovies();
  }, [activeCategoryFilmes, refetchMovies]);
  
  useEffect(() => {
    refetchSeries();
  }, [activeCategorySeries, refetchSeries]);

  // Loading state for the hero section
  const renderHero = () => {
    if (heroLoading) {
      return (
        <div className="flex items-center justify-center w-full h-[90vh] bg-movieDarkBlue">
          <Loader2 className="h-16 w-16 text-movieRed animate-spin" />
        </div>
      );
    }

    if (heroError) {
      return (
        <div className="flex items-center justify-center w-full h-[90vh] bg-movieDarkBlue">
          <div className="text-center">
            <p className="text-white text-2xl">Erro ao carregar filme em destaque</p>
            <button 
              onClick={() => refetchHero()} 
              className="mt-4 px-6 py-2 bg-movieRed text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    return heroMovie && (
      <Hero 
        title={heroMovie.title} 
        description={heroMovie.description} 
        imageUrl={heroMovie.imageUrl} 
        type={heroMovie.type}
        rating={heroMovie.rating}
        year={heroMovie.year}
        duration={heroMovie.duration}
        id={heroMovie.id || ''}
      />
    );
  };

  return (
    <div className="min-h-screen bg-movieDarkBlue">
      <Navbar />
      
      <main>
        {renderHero()}
        
        <div className="py-8">
          <LinhaFilmes 
            title="Filmes" 
            movies={movies ? movies.map(movie => ({...movie, type: 'movie'})) : []}
            categories={categoriesFilmes}
            activeCategory={activeCategoryFilmes}
            onCategoryChange={setActiveCategoryFilmes}
            isLoading={moviesLoading}
            error={moviesError ? "Erro ao carregar filmes" : undefined}
          />
          
          <LinhaFilmes 
            title="Séries" 
            movies={series ? series.map(serie => ({...serie, type: 'series'})) : []}
            categories={categoriesSeries}
            activeCategory={activeCategorySeries}
            onCategoryChange={setActiveCategorySeries}
            isLoading={seriesLoading}
            error={seriesError ? "Erro ao carregar séries" : undefined}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
