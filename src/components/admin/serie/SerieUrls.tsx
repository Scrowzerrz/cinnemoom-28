
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { SerieFormData } from "@/schemas/serieSchema";

interface SerieUrlsProps {
  form: UseFormReturn<SerieFormData>;
}

export function SerieUrls({ form }: SerieUrlsProps) {
  return (
    <Card className="bg-movieDarkBlue/40 border-gray-800">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Links de Mídia</h3>
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="trailer_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do Trailer (YouTube)</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.youtube.com/embed/xpto" {...field} />
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
