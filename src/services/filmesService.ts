import { supabase } from "@/integrations/supabase/client";
import { MovieCardProps } from '@/components/MovieCard';
import { mapToMovieCard } from './utils/movieUtils';
import { FilmeDB, MovieResponse } from './types/movieTypes';

// Função para incrementar visualizações de um filme
export const incrementarVisualizacaoFilme = async (filmeId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('incrementar_visualizacao', {
      tabela: 'filmes',
      item_id: filmeId
    });
    
    if (error) {
      console.error('Erro ao incrementar visualização:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao incrementar visualização:', error);
  }
};

// Função para buscar filmes do Supabase por categoria
export const fetchMovies = async (categoria: string): Promise<MovieCardProps[]> => {
  console.log(`Buscando filmes da categoria: ${categoria}`);
  
  try {
    let query = supabase
      .from('filmes')
      .select('*');
    
    // Lógica para filtrar com base na categoria
    switch (categoria) {
      case 'RECENTES':
        // Filmes recém adicionados - ordenados por data de criação decrescente
        query = query.order('created_at', { ascending: false }).limit(20);
        break;
      
      case 'MAIS VISTOS':
        // Filmes com mais visualizações - agora usando a coluna real de visualizações
        query = query.order('visualizacoes', { ascending: false }).limit(20);
        break;
      
      case 'EM ALTA':
        // Filmes populares nos últimos 30 dias - agora usando visualizações recentes
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
        
        query = query
          .not('ultima_visualizacao', 'is', null)
          .gte('ultima_visualizacao', trintaDiasAtras.toISOString())
          .order('visualizacoes', { ascending: false })
          .limit(20);
        break;
      
      case 'LANÇAMENTOS':
        // Filmes que são lançamentos
        query = query.eq('categoria', 'LANÇAMENTOS');
        break;
      
      default:
        // Se for uma categoria específica (Ação, Comédia, etc)
        query = query.eq('categoria', categoria);
        break;
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar filmes:', error);
      throw error;
    }
    
    return (data || []).map(filme => mapToMovieCard(filme as FilmeDB));
  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
    return [];
  }
};

// Função para buscar todos os filmes (para a página de filmes)
export const fetchAllMovies = async (filtroCategoria?: string): Promise<MovieCardProps[]> => {
  try {
    let query = supabase
      .from('filmes')
      .select('*');
    
    if (filtroCategoria && filtroCategoria !== 'Todos') {
      query = query.eq('categoria', filtroCategoria);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar todos os filmes:', error);
      throw error;
    }
    
    return (data || []).map(filme => mapToMovieCard(filme as FilmeDB));
  } catch (error) {
    console.error('Erro ao buscar todos os filmes:', error);
    return [];
  }
};

// Função para buscar detalhes de um filme específico
export const fetchMovieDetails = async (movieId: string): Promise<MovieResponse | null> => {
  try {
    const { data, error } = await supabase
      .from('filmes')
      .select('*')
      .eq('id', movieId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar detalhes do filme:', error);
      throw error;
    }
    
    if (!data) {
      return null;
    }

    const filme = data as FilmeDB;
    
    return {
      id: filme.id,
      titulo: filme.titulo,
      poster_url: filme.poster_url,
      ano: filme.ano,
      duracao: filme.duracao,
      avaliacao: filme.avaliacao || '0.0',
      tipo: filme.tipo === 'series' ? 'series' : 'movie',
      qualidade: filme.qualidade,
      descricao: filme.descricao,
      categoria: filme.categoria,
      destaque: filme.destaque,
      diretor: filme.diretor,
      elenco: filme.elenco,
      produtor: filme.produtor,
      generos: filme.generos,
      trailer_url: filme.trailer_url,
      player_url: filme.player_url,
      idioma: filme.idioma,
      visualizacoes: filme.visualizacoes
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes do filme:', error);
    return null;
  }
};

// Nova função para buscar um número específico de filmes aleatórios
export const fetchSomeMovies = async (quantidade: number = 5): Promise<MovieResponse[]> => {
  try {
    const { data, error } = await supabase
      .from('filmes')
      .select('*')
      .order('id', { ascending: false }) // Ordenando por ID em ordem decrescente para trazer os mais recentes
      .limit(quantidade);
    
    if (error) {
      console.error('Erro ao buscar filmes aleatórios:', error);
      throw error;
    }
    
    return (data || []).map((filme: FilmeDB) => ({
      id: filme.id,
      titulo: filme.titulo,
      poster_url: filme.poster_url,
      ano: filme.ano,
      duracao: filme.duracao,
      avaliacao: filme.avaliacao || '0.0',
      tipo: filme.tipo === 'series' ? 'series' : 'movie',
      qualidade: filme.qualidade,
      descricao: filme.descricao,
      categoria: filme.categoria,
      destaque: filme.destaque,
      diretor: filme.diretor,
      elenco: filme.elenco,
      produtor: filme.produtor,
      generos: filme.generos,
      trailer_url: filme.trailer_url,
      player_url: filme.player_url,
      idioma: filme.idioma,
      visualizacoes: filme.visualizacoes
    }));
  } catch (error) {
    console.error('Erro ao buscar filmes aleatórios:', error);
    return [];
  }
};
