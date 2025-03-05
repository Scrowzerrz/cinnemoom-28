
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, RefreshCw, Pen } from 'lucide-react';

interface CommentEditFormProps {
  textoEdicao: string;
  setTextoEdicao: (texto: string) => void;
  onCancelarEdicao: () => void;
  onSubmitEdicao: () => void;
  isEditando: boolean;
}

const CommentEditForm = ({
  textoEdicao,
  setTextoEdicao,
  onCancelarEdicao,
  onSubmitEdicao,
  isEditando
}: CommentEditFormProps) => {
  return (
    <div className="mt-2">
      <Textarea 
        value={textoEdicao}
        onChange={(e) => setTextoEdicao(e.target.value)}
        className="bg-gray-800 border-gray-700 rounded-lg p-3 text-white resize-none h-20 focus:ring-movieRed/40 focus:border-movieRed/50"
      />
      <div className="flex justify-end gap-2 mt-2">
        <Button 
          onClick={onCancelarEdicao}
          variant="outline" 
          className="bg-transparent border-gray-600 text-white hover:bg-gray-700"
        >
          <X className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
        <Button 
          onClick={onSubmitEdicao}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={isEditando || !textoEdicao.trim()}
        >
          {isEditando ? (
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
  );
};

export default CommentEditForm;
