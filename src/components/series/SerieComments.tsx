
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useComentarios } from "@/hooks/useComentarios";
import FormularioComentario from '@/components/comentarios/FormularioComentario';
import ListaComentarios from '@/components/comentarios/ListaComentarios';

interface SerieCommentsProps {
  serieId: string;
}

const SerieComments = ({ serieId }: SerieCommentsProps) => {
  const { 
    comentarios, 
    isLoading,
    error,
    refetch,
    adicionarComentario,
    editarComentario,
    excluirComentario,
    alternarVisibilidade,
    alternarCurtida,
    editandoId,
    textoEdicao,
    setTextoEdicao,
    iniciarEdicao,
    cancelarEdicao,
    usuarioLogado,
    perfilUsuario,
    ehAdmin,
    comentarioRespondendoId,
    iniciarResposta
  } = useComentarios(serieId, 'serie');
  
  return (
    <Card className="bg-movieDark/30 border-white/5 backdrop-blur-sm text-white mb-10">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-movieRed" />
          Comentários
        </CardTitle>
        <CardDescription className="text-movieGray">
          Compartilhe suas opiniões sobre esta série
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <FormularioComentario 
          usuarioLogado={usuarioLogado}
          perfilUsuario={perfilUsuario}
          adicionarComentario={adicionarComentario}
        />
        
        <ListaComentarios 
          comentarios={comentarios}
          isLoading={isLoading}
          error={error}
          refetch={refetch}
          usuarioLogado={usuarioLogado}
          perfilUsuarioId={perfilUsuario?.id}
          ehAdmin={ehAdmin}
          editandoId={editandoId}
          textoEdicao={textoEdicao}
          setTextoEdicao={setTextoEdicao}
          onIniciarEdicao={iniciarEdicao}
          onCancelarEdicao={cancelarEdicao}
          onSubmitEdicao={(id) => editarComentario.mutate({ id, texto: textoEdicao })}
          onCurtir={(id, curtido) => alternarCurtida.mutate({ id, curtido })}
          onExcluir={(id) => excluirComentario.mutate(id)}
          onAlternarVisibilidade={(id, visivel) => alternarVisibilidade.mutate({ id, visivel })}
          comentarioRespondendoId={comentarioRespondendoId}
          onResponder={iniciarResposta}
          onSubmitResposta={async (comentarioPaiId, texto) => {
            await adicionarComentario.mutateAsync({
              texto,
              comentarioPaiId
            });
          }}
          isEditando={editarComentario.isPending}
          isExcluindo={excluirComentario.isPending}
          isAlternandoVisibilidade={alternarVisibilidade.isPending}
          isAlternandoCurtida={alternarCurtida.isPending}
          isRespondendo={adicionarComentario.isPending}
        />
      </CardContent>
    </Card>
  );
};

export default SerieComments;
