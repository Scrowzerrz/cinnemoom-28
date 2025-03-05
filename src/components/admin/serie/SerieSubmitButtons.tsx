
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SerieSubmitButtonsProps {
  loading: boolean;
  onCancel: () => void;
  isEditing?: boolean;
}

export function SerieSubmitButtons({ loading, onCancel, isEditing = false }: SerieSubmitButtonsProps) {
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
          isEditing ? 'Salvar Alterações' : 'Adicionar Série'
        )}
      </Button>
    </div>
  );
}
