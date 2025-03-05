
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { SerieFormData } from "@/schemas/serieSchema";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X } from "lucide-react";

interface SerieMetadadosProps {
  form: UseFormReturn<SerieFormData>;
}

export function SerieMetadados({ form }: SerieMetadadosProps) {
  const [novoGenero, setNovoGenero] = useState("");

  const adicionarGenero = () => {
    if (!novoGenero.trim()) return;
    
    const generosAtuais = form.getValues().generos || [];
    if (!generosAtuais.includes(novoGenero)) {
      form.setValue("generos", [...generosAtuais, novoGenero]);
    }
    
    setNovoGenero("");
  };

  const removerGenero = (genero: string) => {
    const generosAtuais = form.getValues().generos || [];
    form.setValue(
      "generos",
      generosAtuais.filter((g) => g !== genero)
    );
  };

  return (
    <Card className="bg-movieDarkBlue/40 border-gray-800">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Metadados</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria Principal</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Ação" {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input placeholder="Ex: 1080p" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="avaliacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avaliação</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 4.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="idioma"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idioma</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Português" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <FormLabel>Gêneros</FormLabel>
            <div className="flex space-x-2 mt-1.5 mb-2">
              <Input
                placeholder="Adicionar gênero"
                value={novoGenero}
                onChange={(e) => setNovoGenero(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), adicionarGenero())}
              />
              <Button 
                type="button" 
                onClick={adicionarGenero} 
                className="bg-movieRed hover:bg-red-700"
              >
                Adicionar
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {form.watch("generos")?.map((genero) => (
                <div 
                  key={genero} 
                  className="px-3 py-1 bg-movieDarkBlue rounded-full text-sm flex items-center gap-1.5"
                >
                  {genero}
                  <button 
                    type="button" 
                    onClick={() => removerGenero(genero)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="destaque"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal cursor-pointer">
                  Destacar na página inicial
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
