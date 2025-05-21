
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
import { PasswordConfirmationModal } from '@/components/modals/PasswordConfirmationModal'; // Uncommented
import { useAuth } from '@/hooks/useAuth'; // Added

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
  const { session } = useAuth(); // Added
  const [loading, setLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<FilmeFormData | null>(null);

  const form = useForm<FilmeFormData>({
    resolver: zodResolver(filmeSchema),
    defaultValues: initialData || {
      destaque: false,
      generos: [],
    },
  });

  // Renamed from onSubmit, now takes data as argument
  const executeMovieUpdate = async (data: FilmeFormData) => {
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
        form.reset(); // Only reset if not editing / creating new
      }
      
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar filme:', error);
      toast.error(isEditing ? "Erro ao atualizar filme" : "Erro ao adicionar filme");
    } finally {
      setLoading(false);
    }
  };

  // New handler for the form's submit event
  const handleFormSubmit = async (data: FilmeFormData) => {
    if (isEditing && filmeId) { // Only prompt for password if editing an existing film
      setFormDataToSubmit(data);
      setIsPasswordModalOpen(true);
      // setLoading(true) will be called by the modal's onConfirm before executeMovieUpdate
    } else {
      // For new movies, submit directly
      await executeMovieUpdate(data);
    }
  };

  const preencherDadosFilme = (dados: Partial<FilmeFormData>) => {
    Object.entries(dados).forEach(([campo, valor]) => {
      form.setValue(campo as keyof FilmeFormData, valor as any);
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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

      {isPasswordModalOpen && formDataToSubmit && (
        <PasswordConfirmationModal
          isOpen={isPasswordModalOpen}
          message="Para sua segurança, por favor insira sua senha para confirmar as alterações no filme."
          onClose={() => {
            setIsPasswordModalOpen(false);
            setFormDataToSubmit(null);
            // setLoading(false); // Safeguard if handleFormSubmit set it true, but it shouldn't.
          }}
          onConfirm={async (enteredPassword: string) => {
            if (!session?.user?.email) {
              toast.error("Usuário não autenticado. Não é possível verificar a senha.");
              throw new Error("Usuário não autenticado.");
            }
            if (!formDataToSubmit) {
               toast.error("Nenhum dado de formulário para submeter.");
               throw new Error("Dados do formulário ausentes.");
            }

            // Verify password with Supabase
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: session.user.email,
              password: enteredPassword,
            });

            if (signInError) {
              console.error("Erro na verificação de senha:", signInError);
              // Customize error message for common Supabase errors if needed
              if (signInError.message === "Invalid login credentials") {
                throw new Error("Senha incorreta. Por favor, tente novamente.");
              }
              throw new Error("Falha na verificação da senha.");
            }

            // Password is correct, proceed with movie update
            await executeMovieUpdate(formDataToSubmit);
            // onSuccess inside executeMovieUpdate will handle further actions.
            // We only need to close this password modal.
            setIsPasswordModalOpen(false); // Close modal on successful execution
            setFormDataToSubmit(null);     // Clear data
          }}
        />
      )}
    </>
  );
}
