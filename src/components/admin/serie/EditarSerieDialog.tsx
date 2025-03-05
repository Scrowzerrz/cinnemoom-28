
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SerieForm } from './SerieForm';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SerieFormData } from '@/schemas/serieSchema';

interface EditarSerieDialogProps {
  serieId: string;
  onSuccess: () => void;
}

export function EditarSerieDialog({ serieId, onSuccess }: EditarSerieDialogProps) {
  const [initialData, setInitialData] = useState<SerieFormData | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDadosSerie() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('series')
          .select('*')
          .eq('id', serieId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setInitialData(data as SerieFormData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da série:', error);
        toast.error('Erro ao carregar dados da série');
      } finally {
        setLoading(false);
      }
    }

    if (serieId) {
      carregarDadosSerie();
    }
  }, [serieId]);

  if (loading) {
    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-movieDark border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl">Editar Série</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center p-8">
          <div className="h-8 w-8 border-4 border-movieRed border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-movieDark border-gray-800">
      <DialogHeader>
        <DialogTitle className="text-2xl">Editar Série</DialogTitle>
      </DialogHeader>
      
      <SerieForm 
        onSuccess={onSuccess} 
        initialData={initialData} 
        serieId={serieId}
        isEditing={true}
        mostrarBuscadorTMDB={false}
      />
    </DialogContent>
  );
}
