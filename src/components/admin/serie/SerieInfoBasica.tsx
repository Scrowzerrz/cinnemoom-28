
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { SerieFormData } from "@/schemas/serieSchema";

interface SerieInfoBasicaProps {
  form: UseFormReturn<SerieFormData>;
}

export function SerieInfoBasica({ form }: SerieInfoBasicaProps) {
  return (
    <Card className="bg-movieDarkBlue/40 border-gray-800">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Informações Básicas</h3>
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Stranger Things" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="titulo_original"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título Original (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Título na língua original" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="ano"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano de Lançamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 2016" {...field} />
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
                  <FormLabel>Duração Média por Episódio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 50min" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="poster_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do Poster</FormLabel>
                <FormControl>
                  <Input placeholder="https://exemplo.com/poster.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
