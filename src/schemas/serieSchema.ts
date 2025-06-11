
import { z } from 'zod';

export const serieSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  titulo_original: z.string().optional(),
  poster_url: z.string().min(1, 'URL do poster é obrigatória'),
  ano: z.string().min(1, 'Ano é obrigatório'),
  duracao: z.string().optional(),
  qualidade: z.string().optional(),
  avaliacao: z.string().optional(),
  destaque: z.boolean().optional().default(false),
  descricao: z.string().optional().default(''),
  categoria: z.string().optional(),
  diretor: z.string().optional(),
  elenco: z.string().optional(),
  produtor: z.string().optional(),
  generos: z.array(z.string()).optional().default([]),
  trailer_url: z.string().optional(),
  idioma: z.string().optional(),
  tipo: z.string().optional().default('series'),
});

export type SerieFormData = z.infer<typeof serieSchema>;

export const temporadaSchema = z.object({
  numero: z.number().min(1, 'Número da temporada é obrigatório'),
  titulo: z.string().optional(),
  ano: z.string().optional(),
  poster_url: z.string().optional(),
});

export type TemporadaFormData = z.infer<typeof temporadaSchema>;

export const episodioSchema = z.object({
  numero: z.number().min(1, 'Número do episódio é obrigatório'),
  titulo: z.string().min(1, 'Título do episódio é obrigatório'),
  descricao: z.string().optional(),
  duracao: z.string().optional(),
  player_url: z.string().optional(),
  thumbnail_url: z.string().optional(),
});

export type EpisodioFormData = z.infer<typeof episodioSchema>;
