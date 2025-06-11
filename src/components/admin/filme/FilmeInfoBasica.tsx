
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
import { FilmeProdutor } from "./FilmeProdutor";

interface FilmeInfoBasicaProps {
  form: UseFormReturn<FilmeFormData>;
}

export function FilmeInfoBasica({ form }: FilmeInfoBasicaProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="titulo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título *</FormLabel>
            <FormControl>
              <Input placeholder="Digite o título do filme" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ano"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ano *</FormLabel>
            <FormControl>
              <Input placeholder="YYYY" maxLength={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="duracao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duração *</FormLabel>
            <FormControl>
              <Input placeholder="2h 30min" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="diretor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Diretor *</FormLabel>
            <FormControl>
              <Input placeholder="Nome do diretor" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FilmeProdutor form={form} />
    </>
  );
}
