
// Arquivo de barril (barrel file) que re-exporta todas as funções de serviços

// Exportações de filmesService
export { 
  fetchMovies, 
  fetchAllMovies, 
  fetchMovieDetails,
  incrementarVisualizacaoFilme,
  fetchSomeMovies
} from './filmesService';

// Exportações de seriesService
export { 
  fetchSeries, 
  fetchAllSeries,
  fetchSerieDetails,
  incrementarVisualizacaoSerie
} from './seriesService';

// Exportações de searchService
export { 
  searchContent 
} from './searchService';

// Exportações de heroService
export { 
  fetchHeroMovie,
  fetchHeroMovies 
} from './heroService';

// Exportação de tipos
export type { 
  MovieResponse,
  SerieDetalhes,
  TemporadaDB,
  EpisodioDB
} from './types/movieTypes';
