
import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FilmeForm } from "./FilmeForm";
import { FilmeFormData } from "@/schemas/filmeSchema";
import { FilmeDB } from "@/services/types/movieTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditarFilmeDialogProps {
  filme: FilmeDB;
  onSuccess: () => void;
}

export function EditarFilmeDialog({ filme, onSuccess }: EditarFilmeDialogProps) {
  const [open, setOpen] = useState(false);
  const [filmeData, setFilmeData] = useState<FilmeFormData | null>(null);
  const [loading, setLoading] = useState(true);

  // Converter os dados do filme para o formato do formulário
  useEffect(() => {
    if (open && filme) {
      const formData: FilmeFormData = {
        titulo: filme.titulo,
        ano: filme.ano || "",
        duracao: filme.duracao || "",
        descricao: filme.descricao || "",
        diretor: filme.diretor || "",
        elenco: filme.elenco || "",
        produtor: filme.produtor || "",
        generos: filme.generos || [],
        categoria: filme.categoria || "",
        qualidade: filme.qualidade || "",
        poster_url: filme.poster_url || "",
        trailer_url: filme.trailer_url || "",
        player_url: filme.player_url || "",
        idioma: filme.idioma || "",
        avaliacao: filme.avaliacao || "",
        destaque: filme.destaque || false,
      };
      
      setFilmeData(formData);
      setLoading(false);
    }
  }, [open, filme]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400"
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Filme: {filme.titulo}</DialogTitle>
          <DialogDescription>
            Atualize os detalhes do filme conforme necessário.
          </DialogDescription>
        </DialogHeader>
        {!loading && filmeData && (
          <FilmeForm 
            onSuccess={() => {
              onSuccess();
              setOpen(false);
            }} 
            initialData={filmeData}
            filmeId={filme.id}
            isEditing={true}
            mostrarBuscadorTMDB={true}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
