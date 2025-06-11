
import { supabase } from "@/integrations/supabase/client";
import { MovieCardProps } from '@/components/MovieCard';
import { mapToMovieCard, serieToFilmeDB } from './utils/movieUtils';
import { FilmeDB } from './types/movieTypes';

// Função para buscar por termo (para a página de pesquisa)
export const searchContent = async (searchTerm: string): Promise<MovieCardProps[]> => {
  try {
    // Buscar filmes que correspondem ao termo de pesquisa
    const { data: filmes, error: filmesError } = await supabase
      .from('filmes')
      .select('*')
      .ilike('titulo', `%${searchTerm}%`);
    
    if (filmesError) {
      console.error('Erro ao pesquisar filmes:', filmesError);
      throw filmesError;
    }
    
    // Buscar séries que correspondem ao termo de pesquisa
    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select('*')
      .ilike('titulo', `%${searchTerm}%`);
    
    if (seriesError) {
      console.error('Erro ao pesquisar séries:', seriesError);
      throw seriesError;
    }
    
    // Combinar resultados de filmes e séries
    const filmesMapped = (filmes || []).map(filme => mapToMovieCard(filme as FilmeDB));
    const seriesMapped = (series || []).map(serie => mapToMovieCard(serieToFilmeDB(serie)));
    
    return [...filmesMapped, ...seriesMapped];
  } catch (error) {
    console.error('Erro ao realizar pesquisa:', error);
    return [];
  }
};
