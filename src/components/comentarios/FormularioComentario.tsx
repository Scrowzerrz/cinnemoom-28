
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormularioComentarioProps {
  usuarioLogado: boolean;
  perfilUsuario: {
    nome?: string | null;
    avatar_url?: string | null;
  } | null;
  adicionarComentario: {
    mutateAsync: (texto: string) => Promise<any>;
    isPending: boolean;
  };
}

const FormularioComentario = ({ 
  usuarioLogado, 
  perfilUsuario, 
  adicionarComentario 
}: FormularioComentarioProps) => {
  const [novoComentario, setNovoComentario] = useState('');
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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

  if (!usuarioLogado) {
    return (
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
              Faça login para deixar seu comentário
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
    );
  }

  return (
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
  );
};

export default FormularioComentario;
