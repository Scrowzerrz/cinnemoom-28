
import { supabase } from "@/integrations/supabase/client";
import { MovieCardProps } from '@/components/MovieCard';
import { mapToMovieCard } from './utils/movieUtils';
import { SerieDB, SerieDetalhes, TemporadaDB, EpisodioDB } from './types/movieTypes';

// Função para incrementar visualizações de uma série
export const incrementarVisualizacaoSerie = async (serieId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('incrementar_visualizacao', {
      tabela: 'series',
      item_id: serieId
    });
    
    if (error) {
      console.error('Erro ao incrementar visualização da série:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao incrementar visualização da série:', error);
  }
};

// Função para buscar séries do Supabase por categoria
export const fetchSeries = async (categoria: string): Promise<MovieCardProps[]> => {
  console.log(`Buscando séries da categoria: ${categoria}`);
  
  try {
    let query = supabase
      .from('series')
      .select('*');
    
    // Lógica para filtrar com base na categoria
    switch (categoria) {
      case 'RECENTES':
        // Séries recém adicionadas - ordenados por data de criação decrescente
        query = query.order('created_at', { ascending: false }).limit(20);
        break;
      
      case 'MAIS VISTOS':
        // Séries com mais visualizações - agora usando a coluna real de visualizações
        query = query.order('visualizacoes', { ascending: false }).limit(20);
        break;
      
      case 'EM ALTA':
        // Séries populares nos últimos 30 dias - agora usando visualizações recentes
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
        
        query = query
          .not('ultima_visualizacao', 'is', null)
          .gte('ultima_visualizacao', trintaDiasAtras.toISOString())
          .order('visualizacoes', { ascending: false })
          .limit(20);
        break;
      
      case 'NOVOS EPISÓDIOS':
      default:
        // Séries com novos episódios (por enquanto, usamos a categoria padrão)
        query = query.eq('categoria', categoria).limit(20);
        break;
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar séries:', error);
      throw error;
    }
    
    // Mapeamos cada série para o formato MovieCardProps
    return (data || []).map(serie => {
      // Adicionamos o campo player_url que está faltando para compatibilidade com mapToMovieCard
      const serieComPlayerUrl = {
        ...serie,
        player_url: '' // Adicionando player_url vazio para compatibilidade
      };
      return mapToMovieCard(serieComPlayerUrl as any);
    });
  } catch (error) {
    console.error('Erro ao buscar séries:', error);
    return [];
  }
};

// Função para buscar todas as séries para a página de séries
export const fetchAllSeries = async (filtroCategoria?: string): Promise<MovieCardProps[]> => {
  try {
    let query = supabase
      .from('series')
      .select('*');
    
    if (filtroCategoria && filtroCategoria !== 'Todos') {
      query = query.eq('categoria', filtroCategoria);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar todas as séries:', error);
      throw error;
    }
    
    // Mapeamos cada série para o formato MovieCardProps
    return (data || []).map(serie => {
      // Adicionamos o campo player_url que está faltando para compatibilidade com mapToMovieCard
      const serieComPlayerUrl = {
        ...serie,
        player_url: '' // Adicionando player_url vazio para compatibilidade
      };
      return mapToMovieCard(serieComPlayerUrl as any);
    });
  } catch (error) {
    console.error('Erro ao buscar todas as séries:', error);
    return [];
  }
};

// Função para buscar detalhes de uma série específica, incluindo temporadas e episódios
export const fetchSerieDetails = async (serieId: string): Promise<SerieDetalhes | null> => {
  try {
    // Buscar informações básicas da série
    const { data: serieData, error: serieError } = await supabase
      .from('series')
      .select('*')
      .eq('id', serieId)
      .single();
    
    if (serieError) {
      console.error('Erro ao buscar detalhes da série:', serieError);
      throw serieError;
    }
    
    if (!serieData) {
      return null;
    }

    const serie = serieData as SerieDB;
    
    // Buscar temporadas da série
    const { data: temporadasData, error: temporadasError } = await supabase
      .from('temporadas')
      .select('*')
      .eq('serie_id', serieId)
      .order('numero', { ascending: true });
    
    if (temporadasError) {
      console.error('Erro ao buscar temporadas da série:', temporadasError);
      throw temporadasError;
    }

    // Mapear temporadas
    const temporadas = await Promise.all((temporadasData || []).map(async (temporada: TemporadaDB) => {
      // Buscar episódios de cada temporada
      const { data: episodiosData, error: episodiosError } = await supabase
        .from('episodios')
        .select('*')
        .eq('temporada_id', temporada.id)
        .order('numero', { ascending: true });
      
      if (episodiosError) {
        console.error(`Erro ao buscar episódios da temporada ${temporada.numero}:`, episodiosError);
        return { ...temporada, episodios: [] };
      }
      
      return {
        ...temporada,
        episodios: episodiosData as EpisodioDB[] || []
      };
    }));
    
    // Construir objeto de detalhes da série
    return {
      ...serie,
      temporadas: temporadas
    } as SerieDetalhes;
  } catch (error) {
    console.error('Erro ao buscar detalhes da série:', error);
    return null;
  }
};
