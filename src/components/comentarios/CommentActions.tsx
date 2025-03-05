
import { Button } from '@/components/ui/button';
import { 
  Heart, Trash, Reply, Pen, Eye, EyeOff,
  RefreshCw 
} from 'lucide-react';

interface CommentActionsProps {
  curtidoPeloUsuario: boolean;
  curtidas: number;
  usuarioLogado: boolean;
  ehComentarioPai: boolean;
  ehAutor: boolean;
  ehAdmin: boolean;
  onResponder: () => void;
  onIniciarEdicao: () => void;
  onExcluir: () => void;
  onCurtir: () => void;
  onAlternarVisibilidade: () => void;
  visivel: boolean;
  isExcluindo: boolean;
  isAlternandoVisibilidade: boolean;
  isAlternandoCurtida: boolean;
}

const CommentActions = ({
  curtidoPeloUsuario,
  curtidas,
  usuarioLogado,
  ehComentarioPai,
  ehAutor,
  ehAdmin,
  onResponder,
  onIniciarEdicao,
  onExcluir,
  onCurtir,
  onAlternarVisibilidade,
  visivel,
  isExcluindo,
  isAlternandoVisibilidade,
  isAlternandoCurtida
}: CommentActionsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mt-3">
      <button 
        onClick={onCurtir}
        className={`text-gray-500 text-sm flex items-center gap-1.5 hover:text-gray-300 disabled:opacity-50 ${
          curtidoPeloUsuario ? 'text-red-400 hover:text-red-500' : ''
        }`}
        disabled={!usuarioLogado || isAlternandoCurtida}
      >
        {curtidoPeloUsuario ? (
          <Heart className="h-4 w-4 fill-red-400" />
        ) : (
          <Heart className="h-4 w-4" />
        )}
        {curtidas}
      </button>
      
      {usuarioLogado && ehComentarioPai && (
        <button 
          onClick={onResponder}
          className="text-gray-500 text-sm hover:text-gray-300 flex items-center gap-1.5"
        >
          <Reply className="h-4 w-4" />
          Responder
        </button>
      )}
      
      {ehAutor && (
        <>
          <button 
            onClick={onIniciarEdicao}
            className="text-gray-500 text-sm hover:text-gray-300"
          >
            Editar
          </button>
          
          <button 
            onClick={onExcluir}
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
      
      {ehAdmin && !ehAutor && (
        <>
          <button 
            onClick={onAlternarVisibilidade}
            className={`text-sm ${
              visivel
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
            ) : visivel ? (
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
            onClick={onExcluir}
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
  );
};

export default CommentActions;
