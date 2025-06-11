import { supabase } from "@/integrations/supabase/client";
import { HeroMovie, FilmeDB } from './types/movieTypes';
import { serieToFilmeDB } from "./utils/movieUtils";

export const fetchHeroMovies = async (): Promise<HeroMovie[]> => {
  try {
    // Buscar 3 filmes em destaque
    const { data: filmesDestaque, error: filmesError } = await supabase
      .from('filmes')
      .select('*')
      .eq('destaque', true)
      .limit(3);

    // Buscar 3 séries em destaque
    const { data: seriesDestaque, error: seriesError } = await supabase
      .from('series')
      .select('*')
      .eq('destaque', true)
      .limit(3);

    let allDestaques: any[] = [];

    // Adicionar filmes se existirem
    if (!filmesError && filmesDestaque) {
      allDestaques.push(...filmesDestaque.map(filme => ({ ...filme, tipo: 'movie' })));
    }

    // Adicionar séries se existirem
    if (!seriesError && seriesDestaque) {
      allDestaques.push(...seriesDestaque.map(serie => ({ ...serie, tipo: 'series' })));
    }

    // Se não há conteúdo em destaque suficiente, buscar conteúdo recente
    if (allDestaques.length < 3) {
      const quantidadeNecessaria = 3 - allDestaques.length;
      
      // Buscar filmes recentes
      const { data: filmesRecentes } = await supabase
        .from('filmes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(quantidadeNecessaria);

      if (filmesRecentes) {
        allDestaques.push(...filmesRecentes.map(filme => ({ ...filme, tipo: 'movie' })));
      }

      // Se ainda não temos 3, buscar séries
      if (allDestaques.length < 3) {
        const quantidadeRestante = 3 - allDestaques.length;
        const { data: seriesRecentes } = await supabase
          .from('series')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(quantidadeRestante);

        if (seriesRecentes) {
          allDestaques.push(...seriesRecentes.map(serie => ({ ...serie, tipo: 'series' })));
        }
      }
    }

    // Pegar apenas os primeiros 3
    const conteudoSelecionado = allDestaques.slice(0, 3);

    if (conteudoSelecionado.length === 0) {
      throw new Error('Nenhum conteúdo encontrado no banco de dados');
    }

    return conteudoSelecionado.map(item => ({
      id: item.id,
      title: item.titulo,
      description: item.descricao || 'Sem descrição disponível',
      imageUrl: item.poster_url,
      type: item.tipo === 'series' ? 'series' : 'movie',
      rating: item.avaliacao || '0.0',
      year: item.ano,
      duration: item.duracao || '0min'
    }));
  } catch (error) {
    console.error('Erro ao buscar conteúdo em destaque:', error);
    throw new Error('Não foi possível carregar conteúdo em destaque');
  }
};

export const fetchHeroMovie = async (): Promise<HeroMovie> => {
  try {
    const heroMovies = await fetchHeroMovies();
    return heroMovies[0];
  } catch (error) {
    console.error('Erro ao buscar filme/série em destaque:', error);
    throw new Error('Não foi possível carregar conteúdo em destaque');
  }
};
