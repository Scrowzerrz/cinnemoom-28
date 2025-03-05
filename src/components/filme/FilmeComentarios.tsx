
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, Trash, Pen, Eye, EyeOff, ShieldCheck,
  MessageSquare, Clock, Send, X, AlertCircle, RefreshCw 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useComentarios } from '@/hooks/useComentarios';

interface FilmeComentariosProps {
  filmeId: string;
}

const FilmeComentarios = ({ filmeId }: FilmeComentariosProps) => {
  const [novoComentario, setNovoComentario] = useState('');
  const navigate = useNavigate();
  
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
    ehAdmin
  } = useComentarios(filmeId, 'filme');

  const handleSubmitComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;
    
    try {
      await adicionarComentario.mutateAsync(novoComentario);
      setNovoComentario('');
    } catch (error) {
      console.error('Erro ao submeter comentário:', error);
    }
  };

  const handleSubmitEdicao = async (id: string) => {
    if (!textoEdicao.trim()) return;
    
    try {
      await editarComentario.mutateAsync({ id, texto: textoEdicao });
    } catch (error) {
      console.error('Erro ao submeter edição:', error);
    }
  };

  const handleCurtir = async (id: string, curtido: boolean) => {
    if (!usuarioLogado) {
      navigate('/auth');
      return;
    }
    
    try {
      await alternarCurtida.mutateAsync({ id, curtido });
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
    }
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (error) {
    return (
      <Alert className="bg-movieDark/30 border-movieRed/30 mb-6">
        <AlertCircle className="h-5 w-5 text-movieRed" />
        <AlertDescription className="text-white ml-2">
          Erro ao carregar comentários. 
          <Button 
            variant="link" 
            className="text-movieRed hover:text-movieRed/80 px-1 py-0"
            onClick={() => refetch()}
          >
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulário para adicionar comentário */}
      {usuarioLogado ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmitComentario}>
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 bg-gray-800">
                {perfilUsuario?.avatar_url ? (
                  <AvatarImage src={perfilUsuario.avatar_url} alt={perfilUsuario.nome || 'Avatar'} />
                ) : (
                  <AvatarFallback className="bg-gray-800 text-white">
                    {perfilUsuario?.nome ? getInitials(perfilUsuario.nome) : 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex-1">
                <Textarea 
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  placeholder="Escreva seu comentário..."
                  className="bg-gray-800 border-gray-700 rounded-lg p-3 text-white resize-none h-24 placeholder:text-gray-500 focus:ring-movieRed/40 focus:border-movieRed/50"
                />
                
                <div className="flex justify-end mt-3">
                  <Button 
                    type="submit" 
                    className="bg-movieRed hover:bg-movieRed/90 text-white flex items-center gap-2"
                    disabled={adicionarComentario.isPending || !novoComentario.trim()}
                  >
                    {adicionarComentario.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Enviar Comentário
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gray-800 rounded-full h-10 w-10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-gray-500" />
            </div>
            <h3 className="text-white text-lg font-medium">Deixe seu comentário</h3>
          </div>
          
          <Alert className="bg-gray-800/50 border-gray-700 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <AlertDescription className="text-gray-300 text-center sm:text-left">
                Faça login para deixar seu comentário neste filme
              </AlertDescription>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-movieRed hover:bg-movieRed/90 text-white w-full sm:w-auto"
              >
                Fazer Login
              </Button>
            </div>
          </Alert>
        </div>
      )}
      
      {/* Lista de comentários */}
      <div className="space-y-4">
        {isLoading ? (
          // Esqueletos de carregamento para comentários
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-800" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 bg-gray-800" />
                  <Skeleton className="h-4 w-full bg-gray-800" />
                  <Skeleton className="h-4 w-full bg-gray-800" />
                  <div className="flex gap-3 mt-2">
                    <Skeleton className="h-8 w-16 bg-gray-800" />
                    <Skeleton className="h-8 w-16 bg-gray-800" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : comentarios.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-600 mb-3" />
            <h3 className="text-white text-lg mb-1">Nenhum comentário ainda</h3>
            <p className="text-gray-400">Seja o primeiro a comentar sobre este filme!</p>
          </div>
        ) : (
          comentarios.map(comentario => (
            <div 
              key={comentario.id} 
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
                      
                      {comentario.usuario_id === perfilUsuario?.id && (
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
                          onClick={cancelarEdicao}
                          variant="outline" 
                          className="bg-transparent border-gray-600 text-white hover:bg-gray-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                        <Button 
                          onClick={() => handleSubmitEdicao(comentario.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={editarComentario.isPending || !textoEdicao.trim()}
                        >
                          {editarComentario.isPending ? (
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
                    <p className="text-gray-300 mt-2 break-words whitespace-pre-wrap">
                      {comentario.texto}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <button 
                      onClick={() => handleCurtir(comentario.id, comentario.curtido_pelo_usuario)}
                      className={`text-gray-500 text-sm flex items-center gap-1.5 hover:text-gray-300 disabled:opacity-50 ${
                        comentario.curtido_pelo_usuario ? 'text-red-400 hover:text-red-500' : ''
                      }`}
                      disabled={!usuarioLogado || alternarCurtida.isPending}
                    >
                      {comentario.curtido_pelo_usuario ? (
                        <Heart className="h-4 w-4 fill-red-400" />
                      ) : (
                        <Heart className="h-4 w-4" />
                      )}
                      {comentario.curtidas}
                    </button>
                    
                    {/* Ações do proprietário do comentário */}
                    {comentario.usuario_id === perfilUsuario?.id && editandoId !== comentario.id && (
                      <>
                        <button 
                          onClick={() => iniciarEdicao(comentario)}
                          className="text-gray-500 text-sm hover:text-gray-300"
                        >
                          Editar
                        </button>
                        
                        <button 
                          onClick={() => excluirComentario.mutate(comentario.id)}
                          className="text-gray-500 text-sm hover:text-red-400"
                          disabled={excluirComentario.isPending}
                        >
                          {excluirComentario.isPending && excluirComentario.variables === comentario.id ? (
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
                    
                    {/* Ações de administrador */}
                    {ehAdmin && comentario.usuario_id !== perfilUsuario?.id && (
                      <>
                        <button 
                          onClick={() => alternarVisibilidade.mutate({
                            id: comentario.id,
                            visivel: comentario.visivel
                          })}
                          className={`text-sm ${
                            comentario.visivel
                              ? 'text-amber-400 hover:text-amber-500'
                              : 'text-green-400 hover:text-green-500'
                          }`}
                          disabled={alternarVisibilidade.isPending}
                        >
                          {alternarVisibilidade.isPending && alternarVisibilidade.variables?.id === comentario.id ? (
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
                          onClick={() => excluirComentario.mutate(comentario.id)}
                          className="text-gray-500 text-sm hover:text-red-400"
                          disabled={excluirComentario.isPending}
                        >
                          {excluirComentario.isPending && excluirComentario.variables === comentario.id ? (
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
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FilmeComentarios;
