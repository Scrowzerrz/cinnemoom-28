
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { SerieFormData } from "@/schemas/serieSchema";

interface SerieDescricaoProps {
  form: UseFormReturn<SerieFormData>;
}

export function SerieDescricao({ form }: SerieDescricaoProps) {
  return (
    <Card className="bg-movieDarkBlue/40 border-gray-800">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Detalhes da Série</h3>
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sinopse</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva a história da série..." 
                    className="min-h-[120px] resize-y"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="diretor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diretor(es)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nomes separados por vírgula" 
                      {...field} 
                    />
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
                    <Input 
                      placeholder="Nomes separados por vírgula" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="elenco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Elenco Principal</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nomes separados por vírgula" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
