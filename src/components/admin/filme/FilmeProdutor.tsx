
import { UseFormReturn } from "react-hook-form";
import { FilmeFormData } from "@/schemas/filmeSchema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FilmeProdutorProps {
  form: UseFormReturn<FilmeFormData>;
}

export function FilmeProdutor({ form }: FilmeProdutorProps) {
  return (
    <FormField
      control={form.control}
      name="produtor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Produtor</FormLabel>
          <FormControl>
            <Input placeholder="Nome do produtor" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
