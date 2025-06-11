import { supabase } from "@/integrations/supabase/client";
import { HeroMovie, FilmeDB } from './types/movieTypes';
import { serieToFilmeDB } from "./utils/movieUtils";

export const fetchHeroMovie = async (): Promise<HeroMovie> => {
  try {
    let { data, error } = await supabase
      .from('filmes')
      .select('*')
      .eq('destaque', true)
      .single();
    
    if (error || !data) {
      const seriesResult = await supabase
        .from('series')
        .select('*')
        .eq('destaque', true)
        .single();
      
      if (seriesResult.error) {
        const fallbackFilmes = await supabase
          .from('filmes')
          .select('*')
          .limit(1)
          .single();
          
        if (fallbackFilmes.error || !fallbackFilmes.data) {
          const fallbackSeries = await supabase
            .from('series')
            .select('*')
            .limit(1)
            .single();
            
          if (fallbackSeries.error || !fallbackSeries.data) {
            throw new Error('Nenhum filme ou série encontrado no banco de dados');
          }
          
          data = serieToFilmeDB(fallbackSeries.data);
        } else {
          data = {
            ...fallbackFilmes.data,
            avaliacao: fallbackFilmes.data.avaliacao || '0.0',
            categoria: fallbackFilmes.data.categoria || '',
            descricao: fallbackFilmes.data.descricao || '',
            destaque: fallbackFilmes.data.destaque || false,
            diretor: fallbackFilmes.data.diretor || '',
            duracao: fallbackFilmes.data.duracao || '',
            elenco: fallbackFilmes.data.elenco || '',
            generos: fallbackFilmes.data.generos || [],
            idioma: fallbackFilmes.data.idioma || '',
            player_url: fallbackFilmes.data.player_url || '',
            produtor: fallbackFilmes.data.produtor || '',
            tipo: fallbackFilmes.data.tipo || 'movie',
            trailer_url: fallbackFilmes.data.trailer_url || ''
          } as FilmeDB;
        }
      } else {
        data = serieToFilmeDB(seriesResult.data);
      }
    } else {
      data = {
        ...data,
        avaliacao: data.avaliacao || '0.0',
        categoria: data.categoria || '',
        descricao: data.descricao || '',
        destaque: data.destaque || false,
        diretor: data.diretor || '',
        duracao: data.duracao || '',
        elenco: data.elenco || '',
        generos: data.generos || [],
        idioma: data.idioma || '',
        player_url: data.player_url || '',
        produtor: data.produtor || '',
        tipo: data.tipo || 'movie',
        trailer_url: data.trailer_url || ''
      } as FilmeDB;
    }
    
    if (!data) {
      throw new Error('Nenhum filme ou série encontrado');
    }
    
    return {
      id: data.id,
      title: data.titulo,
      description: data.descricao || 'Sem descrição disponível',
      imageUrl: data.poster_url,
      type: data.tipo === 'series' ? 'series' : 'movie',
      rating: data.avaliacao || '0.0',
      year: data.ano,
      duration: data.duracao || '0min'
    };
  } catch (error) {
    console.error('Erro ao buscar filme/série em destaque:', error);
    throw new Error('Não foi possível carregar conteúdo em destaque');
  }
};
