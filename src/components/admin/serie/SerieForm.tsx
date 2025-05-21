
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SerieFormData, serieSchema } from "@/schemas/serieSchema";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { SerieInfoBasica } from "./SerieInfoBasica";
import { SerieMetadados } from "./SerieMetadados";
import { SerieUrls } from "./SerieUrls";
import { SerieDescricao } from "./SerieDescricao";
import { SerieTemporadas } from "./SerieTemporadas";
import { SerieSubmitButtons } from "./SerieSubmitButtons";
import { BuscadorTMDBSeries } from "./BuscadorTMDBSeries";
import { PasswordConfirmationModal } from '@/components/modals/PasswordConfirmationModal'; // Uncommented
import { useAuth } from '@/hooks/useAuth'; // Added

interface SerieFormProps {
  onSuccess: () => void;
  initialData?: SerieFormData;
  serieId?: string;
  isEditing?: boolean;
  mostrarBuscadorTMDB?: boolean;
}

export function SerieForm({ 
  onSuccess, 
  initialData, 
  serieId, 
  isEditing = false,
  mostrarBuscadorTMDB = true 
}: SerieFormProps) {
  const { session } = useAuth(); // Added
  const [loading, setLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<SerieFormData | null>(null);
  const [temporadasInfo, setTemporadasInfo] = useState<any[]>([]);

  const form = useForm<SerieFormData>({
    resolver: zodResolver(serieSchema),
    defaultValues: initialData || {
      destaque: false,
      generos: [],
    },
  });

  // Renamed from onSubmit, now takes data as argument
  const executeSerieUpdate = async (data: SerieFormData) => {
    setLoading(true);
    try {
      console.log("Enviando dados da série:", data);
      console.log("Temporadas para criar:", temporadasInfo);
      
      let serie_id: string;
      
      if (isEditing && serieId) {
        // Atualizar série existente
        const { data: serieData, error } = await supabase
          .from('series')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', serieId)
          .select('id')
          .single();

        if (error) throw error;
        serie_id = serieId;
        
        toast.success("Série atualizada com sucesso!");
      } else {
        // Adicionar nova série
        // Garantir que os campos obrigatórios estejam presentes
        if (!data.titulo || !data.ano || !data.poster_url) {
          toast.error("Campos obrigatórios em falta: título, ano ou URL do poster");
          setLoading(false);
          return;
        }
        
        // Criando um objeto com os tipos corretos exigidos pelo Supabase
        // Garantindo que os campos obrigatórios (não opcionais) estejam presentes
        const serieToInsert = {
          titulo: data.titulo,
          ano: data.ano,
          poster_url: data.poster_url,
          titulo_original: data.titulo_original || null,
          duracao: data.duracao || null,
          qualidade: data.qualidade || null,
          avaliacao: data.avaliacao || null,
          destaque: data.destaque || false,
          descricao: data.descricao || null,
          categoria: data.categoria || null,
          diretor: data.diretor || null,
          elenco: data.elenco || null,
          produtor: data.produtor || null,
          generos: data.generos || [],
          trailer_url: data.trailer_url || null,
          idioma: data.idioma || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tipo: 'series'
        };
        
        console.log("Dados a serem inseridos:", serieToInsert);
        
        const { data: serieData, error } = await supabase
          .from('series')
          .insert([serieToInsert])
          .select('id')
          .single();

        if (error) throw error;
        serie_id = serieData.id;
        
        // Se temos temporadas do TMDB, vamos criar
        if (temporadasInfo.length > 0) {
          for (const temporada of temporadasInfo) {
            // Adicionar temporada
            const { data: tempData, error: tempError } = await supabase
              .from('temporadas')
              .insert([{
                serie_id: serie_id,
                numero: temporada.season_number,
                titulo: `Temporada ${temporada.season_number}`,
                ano: temporada.air_date ? new Date(temporada.air_date).getFullYear().toString() : '',
                poster_url: temporada.poster_path ? 
                  `https://image.tmdb.org/t/p/original${temporada.poster_path}` : 
                  data.poster_url
              }])
              .select('id')
              .single();
              
            if (tempError) {
              console.error('Erro ao adicionar temporada:', tempError);
              continue;
            }
            
            // Se temos episódios para esta temporada, vamos adicioná-los
            if (temporada.episodes && temporada.episodes.length > 0) {
              for (const episodio of temporada.episodes) {
                const { error: epError } = await supabase
                  .from('episodios')
                  .insert([{
                    temporada_id: tempData.id,
                    numero: episodio.episode_number,
                    titulo: episodio.name,
                    descricao: episodio.overview,
                    duracao: episodio.runtime ? `${Math.floor(episodio.runtime / 60)}h ${episodio.runtime % 60}min` : '',
                    thumbnail_url: episodio.still_path ? 
                      `https://image.tmdb.org/t/p/original${episodio.still_path}` : 
                      null
                  }]);
                  
                if (epError) {
                  console.error('Erro ao adicionar episódio:', epError);
                }
              }
            }
          }
        }
        
        toast.success("Série adicionada com sucesso!");
        form.reset();
      }
      
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar série:', error);
      toast.error(isEditing ? "Erro ao atualizar série" : "Erro ao adicionar série");
    } finally {
      setLoading(false);
    }
  };

  // New handler for the form's submit event
  const handleFormSubmit = async (data: SerieFormData) => {
    if (isEditing && serieId) { // Only prompt for password if editing an existing series
      setFormDataToSubmit(data);
      setIsPasswordModalOpen(true);
      // setLoading(true) will be called by the modal's onConfirm before executeSerieUpdate
    } else {
      // For new series, submit directly
      await executeSerieUpdate(data);
    }
  };

  const preencherDadosSerie = (dados: Partial<SerieFormData>, temporadas?: any[]) => {
    Object.entries(dados).forEach(([campo, valor]) => {
      form.setValue(campo as keyof SerieFormData, valor as any);
    });
    
    if (temporadas && temporadas.length > 0) {
      setTemporadasInfo(temporadas);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {mostrarBuscadorTMDB && (
            <BuscadorTMDBSeries onSerieEncontrada={preencherDadosSerie} />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SerieInfoBasica form={form} />
          <SerieMetadados form={form} />
        </div>
        <SerieUrls form={form} />
        <SerieDescricao form={form} />
        <SerieTemporadas 
          temporadas={temporadasInfo} 
          serieId={serieId}
          isEditing={isEditing}
        />
        <SerieSubmitButtons 
          loading={loading} 
          onCancel={onSuccess}
          isEditing={isEditing}
        />
        </form>
      </Form>

      {isPasswordModalOpen && formDataToSubmit && (
        <PasswordConfirmationModal
          isOpen={isPasswordModalOpen}
          message="Para sua segurança, por favor insira sua senha para confirmar as alterações na série."
          onClose={() => {
            setIsPasswordModalOpen(false);
            setFormDataToSubmit(null);
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
              if (signInError.message === "Invalid login credentials") {
                throw new Error("Senha incorreta. Por favor, tente novamente.");
              }
              throw new Error("Falha na verificação da senha.");
            }

            // Password is correct, proceed with series update
            await executeSerieUpdate(formDataToSubmit);
            // executeSerieUpdate calls onSuccess, which typically handles dialog closing.
            // We also need to ensure this password modal is closed.
            setIsPasswordModalOpen(false);
            setFormDataToSubmit(null);
          }}
        />
      )}
    </>
  );
}
