
import { useComentarios } from '@/hooks/useComentarios';
import FormularioComentario from '@/components/comentarios/FormularioComentario';
import ListaComentarios from '@/components/comentarios/ListaComentarios';

interface FilmeComentariosProps {
  filmeId: string;
}

const FilmeComentarios = ({ filmeId }: FilmeComentariosProps) => {
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
  } = useComentarios(filmeId, 'filme');

  return (
    <div className="space-y-6">
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
          await adicionarComentario.mutateAsync(texto, comentarioPaiId);
        }}
        isEditando={editarComentario.isPending}
        isExcluindo={excluirComentario.isPending}
        isAlternandoVisibilidade={alternarVisibilidade.isPending}
        isAlternandoCurtida={alternarCurtida.isPending}
        isRespondendo={adicionarComentario.isPending}
      />
    </div>
  );
};

export default FilmeComentarios;
