
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
}

export type TipoItem = 'filme' | 'serie';
