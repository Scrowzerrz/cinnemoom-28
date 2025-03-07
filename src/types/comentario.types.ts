
export interface Comentario {
  id: string;
  usuario_id: string;
  item_id: string;
  item_tipo: 'filme' | 'serie';
  texto: string;
  data_criacao: string;
  data_atualizacao: string;
  visivel: boolean;
  curtidas: number;
  usuario_nome?: string;
  usuario_avatar?: string;
  curtido_pelo_usuario?: boolean;
  usuario_eh_admin?: boolean;
  comentario_pai_id?: string | null;
  respostas?: Comentario[];
  trancado: boolean;
  trancado_por?: string;
  data_trancamento?: string;
  ocultado_por?: string;
  data_ocultacao?: string;
  ocultado_automaticamente?: boolean;
  metadata?: {
    moderationReason?: string;
  };
  ocultado_por_admin?: {
    id: string;
    nome: string;
  } | null;
  trancado_por_admin?: {
    id: string;
    nome: string;
  } | null;
}

export type TipoItem = 'filme' | 'serie';
