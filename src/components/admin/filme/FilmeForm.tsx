
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FilmeFormData, filmeSchema } from "@/schemas/filmeSchema";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { FilmeInfoBasica } from "./FilmeInfoBasica";
import { FilmeMetadados } from "./FilmeMetadados";
import { FilmeUrls } from "./FilmeUrls";
import { FilmeDescricao } from "./FilmeDescricao";
import { FilmeSubmitButtons } from "./FilmeSubmitButtons";
import { BuscadorTMDB } from "./BuscadorTMDB";

interface FilmeFormProps {
  onSuccess: () => void;
  initialData?: FilmeFormData;
  filmeId?: string;
  isEditing?: boolean;
  mostrarBuscadorTMDB?: boolean;
}

export function FilmeForm({ 
  onSuccess, 
  initialData, 
  filmeId, 
  isEditing = false,
  mostrarBuscadorTMDB = true 
}: FilmeFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FilmeFormData>({
    resolver: zodResolver(filmeSchema),
    defaultValues: initialData || {
      destaque: false,
      generos: [],
    },
  });

  const onSubmit = async (data: FilmeFormData) => {
    setLoading(true);
    try {
      if (isEditing && filmeId) {
        // Atualizar filme existente
        const { error } = await supabase
          .from('filmes')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', filmeId);

        if (error) throw error;

        toast.success("Filme atualizado com sucesso!");
      } else {
        // Adicionar novo filme
        const { error } = await supabase
          .from('filmes')
          .insert([{
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tipo: 'movie'
          }] as any);

        if (error) throw error;

        toast.success("Filme adicionado com sucesso!");
        form.reset();
      }
      
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar filme:', error);
      toast.error(isEditing ? "Erro ao atualizar filme" : "Erro ao adicionar filme");
    } finally {
      setLoading(false);
    }
  };

  const preencherDadosFilme = (dados: Partial<FilmeFormData>) => {
    Object.entries(dados).forEach(([campo, valor]) => {
      form.setValue(campo as keyof FilmeFormData, valor as any);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {mostrarBuscadorTMDB && (
          <BuscadorTMDB onFilmeEncontrado={preencherDadosFilme} />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FilmeInfoBasica form={form} />
          <FilmeMetadados form={form} />
        </div>
        <FilmeUrls form={form} />
        <FilmeDescricao form={form} />
        <FilmeSubmitButtons 
          loading={loading} 
          onCancel={onSuccess}
          isEditing={isEditing}
        />
      </form>
    </Form>
  );
}
