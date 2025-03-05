
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Comentario } from '@/types/comentario.types';
import { PerfilUsuario } from '@/hooks/auth/types';
import CommentHeader from './CommentHeader';
import CommentActions from './CommentActions';
import CommentEditForm from './CommentEditForm';
import FormularioResposta from "./FormularioResposta";
import VisibilityWarning from './VisibilityWarning';
import TrancadoWarning from './TrancadoWarning';
import { getInitials } from './utils/commentUtils';

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
  onTrancar?: (id: string) => void;
  onDestrancar?: (id: string) => void;
  onResponder: (comentario: Comentario) => void;
  onSubmitResposta: (comentarioPaiId: string, texto: string) => Promise<void>;
  isEditando: boolean;
  isExcluindo: boolean;
  isAlternandoVisibilidade: boolean;
  isAlternandoCurtida: boolean;
  isTrancando?: boolean;
  isDestrancando?: boolean;
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
  onTrancar,
  onDestrancar,
  onResponder,
  onSubmitResposta,
  isEditando,
  isExcluindo,
  isAlternandoVisibilidade,
  isAlternandoCurtida,
  isTrancando,
  isDestrancando,
  isRespondendo,
  comentarioRespondendoId,
  perfilUsuario,
}: ComentarioCardProps) => {
  const isEditing = editandoId === comentario.id;
  const isReplying = comentarioRespondendoId === comentario.id;
  const isAuthor = comentario.usuario_id === perfilUsuarioId;
  const isParentComment = !comentario.comentario_pai_id;

  return (
    <div 
      className={`bg-gray-900 border ${comentario.visivel ? 'border-gray-800' : 'border-amber-500/30'} 
        ${comentario.trancado ? 'border-red-500/30 bg-red-950/5' : ''} 
        ${!comentario.visivel && 'bg-amber-950/10'} 
        ${comentario.usuario_eh_admin ? 'border-blue-500/30 bg-blue-950/10' : ''} 
        rounded-lg p-4 transition-all`}
    >
      {!comentario.visivel && ehAdmin && <VisibilityWarning />}
      {comentario.trancado && <TrancadoWarning dataTrancamento={comentario.data_trancamento} />}
      
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
          <CommentHeader 
            usuarioNome={comentario.usuario_nome || 'Usuário'}
            usuarioAvatar={comentario.usuario_avatar}
            dataCriacao={comentario.data_criacao}
            usuarioEhAdmin={!!comentario.usuario_eh_admin}
            ehAutor={isAuthor}
          />
          
          {isEditing ? (
            <CommentEditForm 
              textoEdicao={textoEdicao}
              setTextoEdicao={setTextoEdicao}
              onCancelarEdicao={onCancelarEdicao}
              onSubmitEdicao={() => onSubmitEdicao(comentario.id)}
              isEditando={isEditando}
            />
          ) : (
            <>
              <p className="text-gray-300 mt-2 break-words whitespace-pre-wrap">
                {comentario.texto}
              </p>
              
              <CommentActions 
                curtidoPeloUsuario={!!comentario.curtido_pelo_usuario}
                curtidas={comentario.curtidas}
                usuarioLogado={usuarioLogado}
                ehComentarioPai={isParentComment}
                ehAutor={isAuthor}
                ehAdmin={ehAdmin}
                onResponder={() => onResponder(comentario)}
                onIniciarEdicao={() => onIniciarEdicao(comentario)}
                onExcluir={() => onExcluir(comentario.id)}
                onCurtir={() => onCurtir(comentario.id, !!comentario.curtido_pelo_usuario)}
                onAlternarVisibilidade={() => onAlternarVisibilidade(comentario.id, comentario.visivel)}
                onTrancar={onTrancar ? () => onTrancar(comentario.id) : undefined}
                onDestrancar={onDestrancar ? () => onDestrancar(comentario.id) : undefined}
                visivel={comentario.visivel}
                trancado={comentario.trancado}
                isExcluindo={isExcluindo}
                isAlternandoVisibilidade={isAlternandoVisibilidade}
                isAlternandoCurtida={isAlternandoCurtida}
                isTrancando={isTrancando}
                isDestrancando={isDestrancando}
              />
              
              {isReplying && !comentario.trancado && (
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
                      onTrancar={onTrancar}
                      onDestrancar={onDestrancar}
                      onResponder={onResponder}
                      onSubmitResposta={onSubmitResposta}
                      isEditando={isEditando}
                      isExcluindo={isExcluindo}
                      isAlternandoVisibilidade={isAlternandoVisibilidade}
                      isAlternandoCurtida={isAlternandoCurtida}
                      isTrancando={isTrancando}
                      isDestrancando={isDestrancando}
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
