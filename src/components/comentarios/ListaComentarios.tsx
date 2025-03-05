
import { MessageSquare } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertCircle, AlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Comentario } from '@/types/comentario.types';
import ComentarioCard from './ComentarioCard';

interface ListaComentariosProps {
  comentarios: Comentario[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
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
  isEditando: boolean;
  isExcluindo: boolean;
  isAlternandoVisibilidade: boolean;
  isAlternandoCurtida: boolean;
}

const ListaComentarios = ({
  comentarios,
  isLoading,
  error,
  refetch,
  ...props
}: ListaComentariosProps) => {
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
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
        ))}
      </div>
    );
  }

  if (comentarios.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
        <MessageSquare className="h-12 w-12 mx-auto text-gray-600 mb-3" />
        <h3 className="text-white text-lg mb-1">Nenhum comentário ainda</h3>
        <p className="text-gray-400">Seja o primeiro a comentar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comentarios.map(comentario => (
        <ComentarioCard
          key={comentario.id}
          comentario={comentario}
          {...props}
        />
      ))}
    </div>
  );
};

export default ListaComentarios;
