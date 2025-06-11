
import { FilmeDB, SerieDB } from '../types/movieTypes';
import { MovieCardProps } from '@/components/MovieCard';

// Helper function para mapear dados da API para o formato MovieCardProps
export const mapToMovieCard = (movie: FilmeDB): MovieCardProps => {
  return {
    id: movie.id,
    title: movie.titulo,
    posterUrl: movie.poster_url,
    year: movie.ano,
    duration: movie.duracao,
    // Garante que 'tipo' seja 'movie' ou 'series'
    type: movie.tipo === 'series' ? 'series' : 'movie',
    // Tipo seguro para qualidade
    quality: (movie.qualidade || 'HD') as 'HD' | 'CAM' | 'DUB' | 'LEG',
    rating: movie.avaliacao || '0.0'
  };
};

// Função para converter dados de série para o formato FilmeDB
export const serieToFilmeDB = (serie: SerieDB): FilmeDB => {
  return {
    id: serie.id,
    titulo: serie.titulo,
    poster_url: serie.poster_url,
    ano: serie.ano,
    duracao: serie.duracao || '',
    tipo: 'series',
    qualidade: serie.qualidade || 'HD',
    avaliacao: serie.avaliacao || '0.0',
    destaque: serie.destaque || false,
    descricao: serie.descricao || '',
    categoria: serie.categoria || '',
    diretor: serie.diretor || '',
    elenco: serie.elenco || '',
    produtor: serie.produtor || '',
    generos: serie.generos || [],
    trailer_url: serie.trailer_url || '',
    player_url: '', // Adicionando um player_url vazio já que SerieDB não possui essa propriedade
    idioma: serie.idioma || 'DUB',
    created_at: serie.created_at || new Date().toISOString(),
    updated_at: serie.updated_at || new Date().toISOString(),
    visualizacoes: serie.visualizacoes || 0,
    ultima_visualizacao: serie.ultima_visualizacao || null
  };
};
