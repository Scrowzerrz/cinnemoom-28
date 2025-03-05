
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, RefreshCw, X } from 'lucide-react';

interface FormularioRespostaProps {
  usuarioLogado: boolean;
  perfilUsuario: {
    nome?: string | null;
    avatar_url?: string | null;
  } | null;
  onSubmit: (texto: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const FormularioResposta = ({
  usuarioLogado,
  perfilUsuario,
  onSubmit,
  onCancel,
  isSubmitting
}: FormularioRespostaProps) => {
  const [texto, setTexto] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || isSubmitting) return;
    
    await onSubmit(texto);
    setTexto('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <form onSubmit={handleSubmit} className="ml-12 mt-2">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 bg-gray-800">
          {perfilUsuario?.avatar_url ? (
            <AvatarImage src={perfilUsuario.avatar_url} alt={perfilUsuario.nome || 'Avatar'} />
          ) : (
            <AvatarFallback className="bg-gray-800 text-white text-sm">
              {perfilUsuario?.nome ? getInitials(perfilUsuario.nome) : 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1">
          <Textarea 
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva sua resposta..."
            className="bg-gray-800 border-gray-700 rounded-lg p-2 text-white resize-none h-20 placeholder:text-gray-500 focus:ring-movieRed/40 focus:border-movieRed/50 text-sm"
          />
          
          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="bg-transparent border-gray-600 text-white hover:bg-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            
            <Button 
              type="submit"
              size="sm"
              className="bg-movieRed hover:bg-movieRed/90 text-white"
              disabled={isSubmitting || !texto.trim()}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Responder
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default FormularioResposta;
