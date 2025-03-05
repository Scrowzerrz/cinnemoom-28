
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, Trash, Pen, Eye, EyeOff, ShieldCheck,
  Clock, X, RefreshCw, Reply
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Comentario } from '@/types/comentario.types';
import FormularioResposta from "./FormularioResposta";
import { PerfilUsuario } from '@/hooks/auth/types';

interface ComentarioCardProps {
  comentario: Comentario;
  usuarioLogado: boolean;
  perfilUsuarioId?: string;
  ehAdmin: boolean;
  editandoId: string | null;
  textoEdicao: string;
  setTextoEdicao: (texto: string) => void;
  onIniciarEdicao: (comentario: Comentario) => void;
  onCancelarEdicao: () => void;
  onSubmitEdicao: (id: string) => void;
  onCurtir: (id: string, curtido: boolean) => void;
  onExcluir: (id: string) => void;
  onAlternarVisibilidade: (id: string, visivel: boolean) => void;
  onResponder: (comentario: Comentario) => void;
  onSubmitResposta: (comentarioPaiId: string, texto: string) => Promise<void>;
  isEditando: boolean;
  isExcluindo: boolean;
  isAlternandoVisibilidade: boolean;
  isAlternandoCurtida: boolean;
  isRespondendo: boolean;
  comentarioRespondendoId: string | null;
  perfilUsuario: PerfilUsuario | null;
}

const ComentarioCard = ({
  comentario,
  usuarioLogado,
  perfilUsuarioId,
  ehAdmin,
  editandoId,
  textoEdicao,
  setTextoEdicao,
  onIniciarEdicao,
  onCancelarEdicao,
  onSubmitEdicao,
  onCurtir,
  onExcluir,
  onAlternarVisibilidade,
  onResponder,
  onSubmitResposta,
  isEditando,
  isExcluindo,
  isAlternandoVisibilidade,
  isAlternandoCurtida,
  isRespondendo,
  comentarioRespondendoId,
  perfilUsuario,
}: ComentarioCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatarData = (dataString: string) => {
    try {
      return formatDistanceToNow(new Date(dataString), { 
        addSuffix: true,
        locale: ptBR 
      });
    } catch (error) {
      return 'data inválida';
    }
  };

  return (
    <div 
      className={`bg-gray-900 border ${comentario.visivel ? 'border-gray-800' : 'border-amber-500/30'} rounded-lg p-4 transition-all ${!comentario.visivel && 'bg-amber-950/10'} ${comentario.usuario_eh_admin ? 'border-blue-500/30 bg-blue-950/10' : ''}`}
    >
      {!comentario.visivel && ehAdmin && (
        <div className="bg-amber-500/20 text-amber-200 px-3 py-1.5 rounded-md mb-3 text-sm flex items-center gap-2">
          <EyeOff className="h-4 w-4" />
          <span>Este comentário está oculto e só é visível para administradores</span>
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 bg-gray-800">
          {comentario.usuario_avatar ? (
            <AvatarImage src={comentario.usuario_avatar} alt={comentario.usuario_nome || 'Avatar'} />
          ) : (
            <AvatarFallback className="bg-gray-800 text-white">
              {comentario.usuario_nome ? getInitials(comentario.usuario_nome) : 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-white font-medium flex items-center">
              {comentario.usuario_nome || 'Usuário'}
              
              {comentario.usuario_eh_admin && (
                <Badge className="ml-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 px-2 py-0.5">
                  <ShieldCheck className="h-3 w-3" />
                  Admin
                </Badge>
              )}
              
              {comentario.usuario_id === perfilUsuarioId && (
                <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                  Você
                </span>
              )}
            </h4>
            <div className="flex items-center text-gray-400 text-sm">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatarData(comentario.data_criacao)}</span>
            </div>
          </div>
          
          {editandoId === comentario.id ? (
            <div className="mt-2">
              <Textarea 
                value={textoEdicao}
                onChange={(e) => setTextoEdicao(e.target.value)}
                className="bg-gray-800 border-gray-700 rounded-lg p-3 text-white resize-none h-20 focus:ring-movieRed/40 focus:border-movieRed/50"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  onClick={onCancelarEdicao}
                  variant="outline" 
                  className="bg-transparent border-gray-600 text-white hover:bg-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button 
                  onClick={() => onSubmitEdicao(comentario.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isEditando || !textoEdicao.trim()}
                >
                  {isEditando ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Pen className="h-4 w-4 mr-1" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-300 mt-2 break-words whitespace-pre-wrap">
                {comentario.texto}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <button 
                  onClick={() => onCurtir(comentario.id, comentario.curtido_pelo_usuario)}
                  className={`text-gray-500 text-sm flex items-center gap-1.5 hover:text-gray-300 disabled:opacity-50 ${
                    comentario.curtido_pelo_usuario ? 'text-red-400 hover:text-red-500' : ''
                  }`}
                  disabled={!usuarioLogado || isAlternandoCurtida}
                >
                  {comentario.curtido_pelo_usuario ? (
                    <Heart className="h-4 w-4 fill-red-400" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                  {comentario.curtidas}
                </button>
                
                {usuarioLogado && !comentario.comentario_pai_id && (
                  <button 
                    onClick={() => onResponder(comentario)}
                    className="text-gray-500 text-sm hover:text-gray-300 flex items-center gap-1.5"
                  >
                    <Reply className="h-4 w-4" />
                    Responder
                  </button>
                )}
                
                {comentario.usuario_id === perfilUsuarioId && editandoId !== comentario.id && (
                  <>
                    <button 
                      onClick={() => onIniciarEdicao(comentario)}
                      className="text-gray-500 text-sm hover:text-gray-300"
                    >
                      Editar
                    </button>
                    
                    <button 
                      onClick={() => onExcluir(comentario.id)}
                      className="text-gray-500 text-sm hover:text-red-400"
                      disabled={isExcluindo}
                    >
                      {isExcluindo ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin inline-block mr-1" />
                          Excluindo...
                        </>
                      ) : (
                        'Excluir'
                      )}
                    </button>
                  </>
                )}
                
                {ehAdmin && comentario.usuario_id !== perfilUsuarioId && (
                  <>
                    <button 
                      onClick={() => onAlternarVisibilidade(comentario.id, comentario.visivel)}
                      className={`text-sm ${
                        comentario.visivel
                          ? 'text-amber-400 hover:text-amber-500'
                          : 'text-green-400 hover:text-green-500'
                      }`}
                      disabled={isAlternandoVisibilidade}
                    >
                      {isAlternandoVisibilidade ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin inline-block mr-1" />
                          Processando...
                        </>
                      ) : comentario.visivel ? (
                        <>
                          <EyeOff className="h-4 w-4 inline-block mr-1" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 inline-block mr-1" />
                          Mostrar
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => onExcluir(comentario.id)}
                      className="text-gray-500 text-sm hover:text-red-400"
                      disabled={isExcluindo}
                    >
                      {isExcluindo ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin inline-block mr-1" />
                          Excluindo...
                        </>
                      ) : (
                        <>
                          <Trash className="h-4 w-4 inline-block mr-1" />
                          Excluir
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
              
              {comentarioRespondendoId === comentario.id && (
                <FormularioResposta
                  usuarioLogado={usuarioLogado}
                  perfilUsuario={perfilUsuario}
                  onSubmit={(texto) => onSubmitResposta(comentario.id, texto)}
                  onCancel={() => onResponder(null)}
                  isSubmitting={isRespondendo}
                />
              )}
              
              {comentario.respostas && comentario.respostas.length > 0 && (
                <div className="mt-4 space-y-4 ml-8 border-l-2 border-gray-800 pl-4">
                  {comentario.respostas.map(resposta => (
                    <ComentarioCard
                      key={resposta.id}
                      comentario={resposta}
                      usuarioLogado={usuarioLogado}
                      perfilUsuarioId={perfilUsuarioId}
                      ehAdmin={ehAdmin}
                      editandoId={editandoId}
                      textoEdicao={textoEdicao}
                      setTextoEdicao={setTextoEdicao}
                      onIniciarEdicao={onIniciarEdicao}
                      onCancelarEdicao={onCancelarEdicao}
                      onSubmitEdicao={onSubmitEdicao}
                      onCurtir={onCurtir}
                      onExcluir={onExcluir}
                      onAlternarVisibilidade={onAlternarVisibilidade}
                      onResponder={onResponder}
                      onSubmitResposta={onSubmitResposta}
                      isEditando={isEditando}
                      isExcluindo={isExcluindo}
                      isAlternandoVisibilidade={isAlternandoVisibilidade}
                      isAlternandoCurtida={isAlternandoCurtida}
                      isRespondendo={isRespondendo}
                      comentarioRespondendoId={comentarioRespondendoId}
                      perfilUsuario={perfilUsuario}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComentarioCard;
