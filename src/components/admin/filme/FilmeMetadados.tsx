import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORIAS, GENEROS, QUALIDADES } from "@/schemas/filmeSchema";
import { UseFormReturn } from "react-hook-form";
import { FilmeFormData } from "@/schemas/filmeSchema";

interface FilmeMetadadosProps {
  form: UseFormReturn<FilmeFormData>;
}

export function FilmeMetadados({ form }: FilmeMetadadosProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="avaliacao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Avaliação (0-5)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="Ex: 4.5"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="categoria"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CATEGORIAS.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="qualidade"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qualidade</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a qualidade" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {QUALIDADES.map((qualidade) => (
                  <SelectItem key={qualidade} value={qualidade}>
                    {qualidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="generos"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gêneros</FormLabel>
            <div className="flex flex-wrap gap-2">
              {GENEROS.map((genero) => (
                <div key={genero} className="space-x-2">
                  <Label htmlFor={genero} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                    {genero}
                  </Label>
                  <Checkbox
                    id={genero}
                    checked={field.value?.includes(genero)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([...(field.value || []), genero]);
                      } else {
                        field.onChange(field.value?.filter((v) => v !== genero));
                      }
                    }}
                  />
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="destaque"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
            <div className="space-y-0.5">
              <FormLabel>Destaque</FormLabel>
              <p className="text-sm text-muted-foreground">
                Mostrar este filme na página inicial
              </p>
            </div>
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
