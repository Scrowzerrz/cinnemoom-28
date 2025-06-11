
import { UseFormReturn } from "react-hook-form";
import { FilmeFormData } from "@/schemas/filmeSchema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface FilmeDescricaoProps {
  form: UseFormReturn<FilmeFormData>;
}

export function FilmeDescricao({ form }: FilmeDescricaoProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="descricao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição *</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Digite a sinopse do filme..." 
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="destaque"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
            <FormControl>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="font-normal">
              Destacar este filme na página inicial
            </FormLabel>
          </FormItem>
        )}
      />
    </>
  );
}
