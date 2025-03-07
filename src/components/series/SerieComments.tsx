
import { useComentarios } from '@/hooks/useComentarios';
import FormularioComentario from '@/components/comentarios/FormularioComentario';
import ListaComentarios from '@/components/comentarios/ListaComentarios';
import { toast } from 'sonner';

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
    trancar,
    destrancar,
    editandoId,
    textoEdicao,
    setTextoEdicao,
    iniciarEdicao,
    cancelarEdicao,
    usuarioLogado,
    perfilUsuario,
    ehAdmin,
    comentarioRespondendoId,
    iniciarResposta,
    comentariosOcultosCount,
    comentariosOcultosAbertos,
    alternarComentariosOcultos
  } = useComentarios(serieId, 'serie');

  // Função para lidar com likes
  const handleCurtida = (id: string, curtido: boolean) => {
    alternarCurtida.mutate({ id, curtido }, {
      onSuccess: () => {
        if (!curtido) {
          toast.success('Curtida adicionada com sucesso!');
        }
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-white mb-4">Comentários</h2>
      
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
        onCurtir={handleCurtida}
        onExcluir={(id) => excluirComentario.mutate(id)}
        onAlternarVisibilidade={(id, visivel) => alternarVisibilidade.mutate({ id, visivel })}
        onTrancar={(id) => trancar.mutate(id)}
        onDestrancar={(id) => destrancar.mutate(id)}
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
        isTrancando={trancar.isPending}
        isDestrancando={destrancar.isPending}
        isRespondendo={adicionarComentario.isPending}
        perfilUsuario={perfilUsuario}
        comentariosOcultosCount={comentariosOcultosCount}
        comentariosOcultosAbertos={comentariosOcultosAbertos}
        alternarComentariosOcultos={alternarComentariosOcultos}
      />
    </div>
  );
};

export default SerieComments;
