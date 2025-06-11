
import { useState } from "react";
import { Plus } from "lucide-react";
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

export function NovoFilmeDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-movieRed hover:bg-red-700 gap-1">
          <Plus className="h-4 w-4" />
          <span>Novo Filme</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Filme</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do filme. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <FilmeForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
