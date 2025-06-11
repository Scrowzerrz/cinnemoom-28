
import { z } from "zod";

export const filmeSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  ano: z.string().regex(/^\d{4}$/, "Ano deve estar no formato YYYY"),
  duracao: z.string().min(1, "Duração é obrigatória"),
  descricao: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres"),
  diretor: z.string().min(1, "Diretor é obrigatório"),
  elenco: z.string().min(1, "Elenco é obrigatório"),
  produtor: z.string().optional(),
  generos: z.array(z.string()).min(1, "Selecione pelo menos um gênero"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  qualidade: z.string().min(1, "Qualidade é obrigatória"),
  poster_url: z.string().url("URL do poster inválida"),
  trailer_url: z.string().url("URL do trailer inválida").optional(),
  player_url: z.string().url("URL do player inválida"),
  idioma: z.string().min(1, "Idioma é obrigatório"),
  avaliacao: z.string().min(1, "Avaliação é obrigatória"),
  destaque: z.boolean().default(false),
}).strict();

export type FilmeFormData = z.infer<typeof filmeSchema>;

export const CATEGORIAS = [
  "Ação",
  "Aventura",
  "Comédia",
  "Drama",
  "Ficção Científica",
  "Romance",
  "Terror",
  "Documentário",
  "LANÇAMENTOS",
] as const;

export const QUALIDADES = [
  "4K",
  "1080p",
  "720p",
  "SD",
] as const;

export const GENEROS = [
  "Ação",
  "Aventura",
  "Animação",
  "Comédia",
  "Crime",
  "Documentário",
  "Drama",
  "Família",
  "Fantasia",
  "Ficção Científica",
  "Guerra",
  "História",
  "Mistério",
  "Música",
  "Romance",
  "Suspense",
  "Terror",
  "Western",
] as const;
