
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
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

// Quantidade inicial de respostas a exibir
const RESPOSTAS_INICIAIS = 3;

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
  const moderationReason = comentario.metadata?.moderationReason;
  
  // Estado para controlar a expansão das respostas
  const [mostrarTodasRespostas, setMostrarTodasRespostas] = useState(false);
  
  // Determina se há muitas respostas que precisam ser colapsadas
  const temMuitasRespostas = comentario.respostas && comentario.respostas.length > RESPOSTAS_INICIAIS;
  
  // Filtra as respostas com base no estado de expansão
  const respostasExibidas = comentario.respostas && comentario.respostas.length > 0
    ? mostrarTodasRespostas 
      ? comentario.respostas 
      : comentario.respostas.slice(0, RESPOSTAS_INICIAIS)
    : [];
    
  // Quantidade de respostas ocultas
  const respostasOcultas = comentario.respostas 
    ? comentario.respostas.length - (mostrarTodasRespostas ? comentario.respostas.length : RESPOSTAS_INICIAIS)
    : 0;
    
  // Função para alternar a visualização de todas as respostas
  const alternarMostrarRespostas = () => {
    setMostrarTodasRespostas(!mostrarTodasRespostas);
  };

  return (
    <div 
      className={`bg-gray-900 border ${comentario.visivel ? 'border-gray-800' : 'border-amber-500/30'} 
        ${comentario.trancado ? 'border-red-500/30 bg-red-950/5' : ''} 
        ${!comentario.visivel && 'bg-amber-950/10'} 
        ${comentario.usuario_eh_admin ? 'border-blue-500/30 bg-blue-950/10' : ''} 
        rounded-lg p-3 md:p-4 transition-all overflow-hidden break-words`}
    >
      {!comentario.visivel && ehAdmin && (
        <VisibilityWarning 
          moderationReason={moderationReason} 
          ocultadoAutomaticamente={!!comentario.ocultado_automaticamente}
          ocultadoPorAdmin={comentario.ocultado_por_admin}
          dataOcultacao={comentario.data_ocultacao}
        />
      )}
      
      {comentario.trancado && (
        <TrancadoWarning 
          dataTrancamento={comentario.data_trancamento} 
          trancadoPorAdmin={comentario.trancado_por_admin}
        />
      )}
      
      <div className="flex items-start gap-2 md:gap-3">
        <Avatar className="h-8 w-8 md:h-10 md:w-10 bg-gray-800 flex-shrink-0">
          {comentario.usuario_avatar ? (
            <AvatarImage src={comentario.usuario_avatar} alt={comentario.usuario_nome || 'Avatar'} />
          ) : (
            <AvatarFallback className="bg-gray-800 text-white text-xs md:text-sm">
              {comentario.usuario_nome ? getInitials(comentario.usuario_nome) : 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1 min-w-0">
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
              <p className="text-gray-300 mt-2 break-words whitespace-pre-wrap text-sm md:text-base">
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
              
              {respostasExibidas && respostasExibidas.length > 0 && (
                <div className="mt-4 space-y-4 border-l-2 border-gray-800 pl-3 md:pl-4 ml-2 md:ml-4">
                  {/* Área com scroll para respostas quando são muitas */}
                  <ScrollArea className={respostasExibidas.length > 5 ? "max-h-[400px] pr-2" : ""}>
                    <div className="space-y-4">
                      {respostasExibidas.map(resposta => (
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
                  </ScrollArea>
                  
                  {/* Botão para ver mais respostas */}
                  {temMuitasRespostas && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={alternarMostrarRespostas}
                      className="text-xs text-gray-400 hover:text-white hover:bg-gray-800 w-full mt-2"
                    >
                      {mostrarTodasRespostas ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Mostrar menos respostas
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Ver mais {respostasOcultas} respostas
                        </>
                      )}
                    </Button>
                  )}
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
