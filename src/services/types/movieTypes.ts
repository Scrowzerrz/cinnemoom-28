
// Interfaces para os dados de filmes e séries

// Interface para os dados brutos do banco de dados
export interface FilmeDB {
  id: string;
  titulo: string;
  poster_url: string;
  ano: string;
  duracao: string;
  tipo: string;
  qualidade: string;
  avaliacao: string;
  destaque: boolean;
  descricao: string;
  categoria: string;
  diretor: string;
  elenco: string;
  produtor: string;
  generos: string[];
  trailer_url: string;
  player_url: string;
  idioma: string;
  created_at: string;
  updated_at: string;
  visualizacoes: number;
  ultima_visualizacao: string | null;
}

// Interface para os dados de série
export interface SerieDB {
  id: string;
  titulo: string;
  titulo_original?: string;
  poster_url: string;
  ano: string;
  duracao: string;
  tipo: string;
  qualidade: string;
  avaliacao: string;
  destaque: boolean;
  descricao: string;
  categoria: string;
  diretor: string;
  elenco: string;
  produtor: string;
  generos: string[];
  trailer_url: string;
  idioma: string;
  created_at: string;
  updated_at: string;
  visualizacoes: number;
  ultima_visualizacao: string | null;
}

// Interface para temporadas
export interface TemporadaDB {
  id: string;
  serie_id: string;
  numero: number;
  titulo: string;
  ano: string;
  poster_url: string;
  created_at: string;
  updated_at: string;
  episodios?: EpisodioDB[];
}

// Interface para episódios
export interface EpisodioDB {
  id: string;
  temporada_id: string;
  numero: number;
  titulo: string;
  descricao: string;
  duracao: string;
  player_url: string;
  thumbnail_url: string;
  created_at: string;
  updated_at: string;
}

// API interfaces
export interface MovieResponse {
  id: string;
  titulo: string;
  titulo_original?: string;
  poster_url: string;
  ano: string;
  duracao?: string;
  avaliacao: string;
  tipo: 'movie' | 'series';
  qualidade?: string;
  descricao?: string;
  categoria?: string;
  destaque?: boolean;
  diretor?: string;
  elenco?: string;
  produtor?: string;
  generos?: string[];
  trailer_url?: string;
  player_url?: string;
  idioma?: string;
  visualizacoes?: number;
}

// Interface para o filme em destaque
export interface HeroMovie {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  type: 'movie' | 'series';
  rating: string;
  year: string;
  duration: string;
}

// Interface para detalhes completos da série
export interface SerieDetalhes extends SerieDB {
  temporadas: (TemporadaDB & { episodios: EpisodioDB[] })[];
}
