
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FilmeSubmitButtonsProps {
  loading: boolean;
  onCancel: () => void;
  isEditing?: boolean;
}

export function FilmeSubmitButtons({ loading, onCancel, isEditing = false }: FilmeSubmitButtonsProps) {
  return (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={loading}
        className="bg-movieRed hover:bg-red-700"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditing ? 'Salvando...' : 'Adicionando...'}
          </>
        ) : (
          isEditing ? 'Salvar Alterações' : 'Adicionar Filme'
        )}
      </Button>
    </div>
  );
}
