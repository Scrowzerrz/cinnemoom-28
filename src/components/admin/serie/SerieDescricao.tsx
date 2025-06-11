
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { SerieFormData } from "@/schemas/serieSchema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SerieDescricaoProps {
  form: UseFormReturn<SerieFormData>;
}

export function SerieDescricao({ form }: SerieDescricaoProps) {
  return (
    <Card className="bg-movieDarkBlue/40 border-gray-800">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Descrição e Créditos</h3>
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sinopse</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descrição da série..." 
                    className="min-h-28 resize-y"
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="diretor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diretor(es)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Matt Duffer, Ross Duffer" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="produtor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produtor(es)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Shawn Levy, Dan Cohen" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="elenco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Elenco Principal</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Millie Bobby Brown, Finn Wolfhard, Winona Ryder" {...field} value={field.value || ''} />
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
