
import { supabase } from "@/integrations/supabase/client";
import { MovieCardProps } from '@/components/MovieCard';
import { mapToMovieCard } from './utils/movieUtils';
import { SerieDB, SerieDetalhes, TemporadaDB, EpisodioDB } from './types/movieTypes';

// Função para buscar séries com novos episódios baseada na data de criação dos episódios
const fetchSeriesComNovosEpisodios = async (): Promise<MovieCardProps[]> => {
  console.log('Buscando séries com novos episódios nos últimos 30 dias...');
  
  try {
    // Calcular data limite para episódios recentes
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    const dataLimite = trintaDiasAtras.toISOString();
    
    // Buscar episódios criados recentemente
    const { data: episodiosRecentes, error: episodiosError } = await supabase
      .from('episodios')
      .select(`
        id,
        created_at,
        temporada_id,
        temporadas(
          id,
          serie_id
        )
      `)
      .gte('created_at', dataLimite)
      .order('created_at', { ascending: false });
    
    if (episodiosError) {
      console.error('Erro ao buscar episódios recentes:', episodiosError);
      return await buscarSeriesMaisRecentes();
    }
    
    if (!episodiosRecentes || episodiosRecentes.length === 0) {
      console.log('Nenhum episódio encontrado nos últimos 30 dias');
      return await buscarSeriesMaisRecentes();
    }
    
    // Extrair IDs únicos de séries ordenados pela data do episódio mais recente
    const serieIds = new Map<string, number>();
    
    episodiosRecentes.forEach((episodio: any) => {
      const serieId = episodio.temporadas?.serie_id;
      const dataEpisodio = new Date(episodio.created_at).getTime();
      
      if (serieId && (!serieIds.has(serieId) || serieIds.get(serieId)! < dataEpisodio)) {
        serieIds.set(serieId, dataEpisodio);
      }
    });
    
    // Ordenar série IDs por data do último episódio e limitar
    const serieIdsOrdenados = Array.from(serieIds.entries())
      .sort((a, b) => b[1] - a[1]) // Ordenar por timestamp decrescente
      .slice(0, 20)
      .map(entry => entry[0]);
    
    if (serieIdsOrdenados.length === 0) {
      console.log('Nenhuma série encontrada com episódios recentes');
      return await buscarSeriesMaisRecentes();
    }
    
    // Buscar dados completos das séries
    const { data: seriesCompletas, error: seriesError } = await supabase
      .from('series')
      .select('*')
      .in('id', serieIdsOrdenados);
    
    if (seriesError) {
      console.error('Erro ao buscar dados das séries:', seriesError);
      return await buscarSeriesMaisRecentes();
    }
    
    if (!seriesCompletas || seriesCompletas.length === 0) {
      return await buscarSeriesMaisRecentes();
    }
    
    // Ordenar séries de acordo com a ordem dos episódios mais recentes
    const seriesOrdenadas = serieIdsOrdenados
      .map(id => seriesCompletas.find(serie => serie.id === id))
      .filter(Boolean);
    
    console.log(`Encontradas ${seriesOrdenadas.length} séries com novos episódios`);
    
    return seriesOrdenadas.map(serie => {
      const serieComPlayerUrl = {
        ...serie,
        player_url: ''
      };
      return mapToMovieCard(serieComPlayerUrl as any);
    });
    
  } catch (error) {
    console.error('Erro geral ao buscar séries com novos episódios:', error);
    return await buscarSeriesMaisRecentes();
  }
};

// Função auxiliar para buscar séries mais recentes como fallback
const buscarSeriesMaisRecentes = async (): Promise<MovieCardProps[]> => {
  try {
    console.log('Buscando séries mais recentes como alternativa');
    const { data: seriesRecentes, error } = await supabase
      .from('series')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15);
    
    if (error) throw error;
    
    return (seriesRecentes || []).map(serie => {
      const serieComPlayerUrl = {
        ...serie,
        player_url: ''
      };
      return mapToMovieCard(serieComPlayerUrl as any);
    });
    
  } catch (error) {
    console.error('Erro ao buscar séries mais recentes:', error);
    return [];
  }
};

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
        // Buscar séries com episódios adicionados recentemente
        return await fetchSeriesComNovosEpisodios();
      
      default:
        // Para outras categorias, usar filtro padrão
        query = query.eq('categoria', categoria).limit(20);
        break;
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar séries:', error);
      throw error;
    }
    
    console.log(`Encontradas ${data?.length || 0} séries para a categoria ${categoria}`);
    
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
    console.log(`Buscando todas as séries ${filtroCategoria ? `com filtro: ${filtroCategoria}` : 'sem filtro'}`);
    
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
    
    console.log(`Encontradas ${data?.length || 0} séries`);
    
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
    console.log(`Buscando detalhes da série ID: ${serieId}`);
    
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
      console.error('Série não encontrada com ID:', serieId);
      return null;
    }

    console.log(`Série encontrada: ${serieData.titulo}`);
    const serie = serieData as SerieDB;
    
    // Buscar temporadas da série
    console.log(`Buscando temporadas para série ID: ${serieId}`);
    const { data: temporadasData, error: temporadasError } = await supabase
      .from('temporadas')
      .select('*')
      .eq('serie_id', serieId)
      .order('numero', { ascending: true });
    
    if (temporadasError) {
      console.error('Erro ao buscar temporadas da série:', temporadasError);
      throw temporadasError;
    }

    console.log(`Encontradas ${temporadasData?.length || 0} temporadas para a série ${serie.titulo}`);

    // Mapear temporadas
    const temporadas = await Promise.all((temporadasData || []).map(async (temporada: TemporadaDB) => {
      // Buscar episódios de cada temporada
      console.log(`Buscando episódios para temporada ${temporada.numero} (ID: ${temporada.id})`);
      const { data: episodiosData, error: episodiosError } = await supabase
        .from('episodios')
        .select('*')
        .eq('temporada_id', temporada.id)
        .order('numero', { ascending: true });
      
      if (episodiosError) {
        console.error(`Erro ao buscar episódios da temporada ${temporada.numero}:`, episodiosError);
        return { ...temporada, episodios: [] };
      }
      
      console.log(`Encontrados ${episodiosData?.length || 0} episódios para temporada ${temporada.numero}`);
      
      return {
        ...temporada,
        episodios: episodiosData as EpisodioDB[] || []
      };
    }));
    
    // Construir objeto de detalhes da série
    const serieDetalhes = {
      ...serie,
      temporadas: temporadas
    } as SerieDetalhes;
    
    console.log(`Detalhes da série ${serie.titulo} carregados com sucesso com ${temporadas.length} temporadas`);
    return serieDetalhes;
  } catch (error) {
    console.error('Erro ao buscar detalhes da série:', error);
    return null;
  }
};
