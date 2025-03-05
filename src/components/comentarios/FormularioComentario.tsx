
import { useState } from 'react';
import { UseMutationResult } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, RefreshCw } from 'lucide-react';
import { PerfilUsuario } from '@/hooks/auth/types';

interface FormularioComentarioProps {
  usuarioLogado: boolean;
  perfilUsuario: PerfilUsuario | null;
  adicionarComentario: UseMutationResult<
    void, 
    Error, 
    { texto: string; comentarioPaiId?: string | null }, 
    unknown
  >;
}

const FormularioComentario = ({
  usuarioLogado,
  perfilUsuario,
  adicionarComentario
}: FormularioComentarioProps) => {
  const [texto, setTexto] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || adicionarComentario.isPending) return;
    
    adicionarComentario.mutate({ texto: texto.trim() }, {
      onSuccess: () => setTexto('')
    });
  };

  if (!usuarioLogado) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
        <p className="text-gray-400">Você precisa estar logado para comentar</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <h3 className="text-white font-medium mb-2">Deixe seu comentário</h3>
      <Textarea 
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="O que você achou?"
        className="bg-gray-800 border-gray-700 rounded-lg p-3 text-white resize-none h-24 placeholder:text-gray-500 focus:ring-movieRed/40 focus:border-movieRed/50"
      />
      <div className="flex justify-end mt-3">
        <Button 
          type="submit"
          className="bg-movieRed hover:bg-movieRed/90 text-white"
          disabled={adicionarComentario.isPending || !texto.trim()}
        >
          {adicionarComentario.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Comentar
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default FormularioComentario;
