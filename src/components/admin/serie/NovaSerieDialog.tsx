
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SerieForm } from './SerieForm';

interface NovaSerieDialogProps {
  onSuccess: () => void;
}

export function NovaSerieDialog({ onSuccess }: NovaSerieDialogProps) {
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-movieDark border-gray-800">
      <DialogHeader>
        <DialogTitle className="text-2xl">Adicionar Nova Série</DialogTitle>
      </DialogHeader>
      
      <SerieForm onSuccess={onSuccess} />
    </DialogContent>
  );
}
