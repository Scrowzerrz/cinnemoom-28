
import { useState } from 'react';
import { MessageSquare, AlertCircle, ChevronDown } from 'lucide-react';
import { Alert } from "@/components/ui/alert";
import { AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Comentario } from '@/types/comentario.types';
import ComentarioCard from './ComentarioCard';
import ComentariosOcultosToggle from './ComentariosOcultosToggle';
import { PerfilUsuario } from '@/hooks/auth/types';

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
  onTrancar?: (id: string) => void;
  onDestrancar?: (id: string) => void;
  comentarioRespondendoId: string | null;
  onResponder: (comentario: Comentario) => void;
  onSubmitResposta: (comentarioPaiId: string, texto: string) => Promise<void>;
  isEditando: boolean;
  isExcluindo: boolean;
  isAlternandoVisibilidade: boolean;
  isAlternandoCurtida: boolean;
  isTrancando?: boolean;
  isDestrancando?: boolean;
  isRespondendo: boolean;
  perfilUsuario: PerfilUsuario | null;
  comentariosOcultosCount?: number;
  comentariosOcultosAbertos?: boolean;
  alternarComentariosOcultos?: () => void;
}

// Quantidade inicial de comentários a exibir
const COMENTARIOS_POR_PAGINA = 5;

const ListaComentarios = ({
  comentarios,
  isLoading,
  error,
  refetch,
  comentariosOcultosCount = 0,
  comentariosOcultosAbertos = false,
  alternarComentariosOcultos,
  ehAdmin,
  ...props
}: ListaComentariosProps) => {
  const [limiteComentarios, setLimiteComentarios] = useState(COMENTARIOS_POR_PAGINA);
  
  // Determina se existem mais comentários além do limite atual
  const temMaisComentarios = comentarios.length > limiteComentarios;
  
  // Comentários a serem exibidos (limitados)
  const comentariosExibidos = comentarios.slice(0, limiteComentarios);
  
  // Função para carregar mais comentários
  const carregarMaisComentarios = () => {
    setLimiteComentarios(limiteAnterior => limiteAnterior + COMENTARIOS_POR_PAGINA);
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
      <>
        {ehAdmin && comentariosOcultosCount > 0 && alternarComentariosOcultos && (
          <ComentariosOcultosToggle 
            count={comentariosOcultosCount} 
            aberto={comentariosOcultosAbertos} 
            onAlternar={alternarComentariosOcultos} 
          />
        )}
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-600 mb-3" />
          <h3 className="text-white text-lg mb-1">Nenhum comentário ainda</h3>
          <p className="text-gray-400">Seja o primeiro a comentar!</p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {ehAdmin && comentariosOcultosCount > 0 && alternarComentariosOcultos && (
        <ComentariosOcultosToggle 
          count={comentariosOcultosCount} 
          aberto={comentariosOcultosAbertos} 
          onAlternar={alternarComentariosOcultos} 
        />
      )}
      
      {comentariosExibidos.map(comentario => (
        <ComentarioCard
          key={comentario.id}
          comentario={comentario}
          ehAdmin={ehAdmin}
          {...props}
        />
      ))}
      
      {/* Botão de "Ver mais comentários" */}
      {temMaisComentarios && (
        <Button 
          variant="outline" 
          className="w-full text-gray-300 border-gray-700 hover:bg-gray-800 mt-2"
          onClick={carregarMaisComentarios}
        >
          <ChevronDown className="h-4 w-4 mr-2" />
          Ver mais comentários ({comentarios.length - limiteComentarios} restantes)
        </Button>
      )}
    </div>
  );
};

export default ListaComentarios;
