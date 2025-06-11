
import { UseFormReturn } from "react-hook-form";
import { FilmeFormData } from "@/schemas/filmeSchema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FilmeUrlsProps {
  form: UseFormReturn<FilmeFormData>;
}

export function FilmeUrls({ form }: FilmeUrlsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="poster_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL do Poster *</FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="trailer_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL do Trailer</FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} />
            </FormControl>
            <FormDescription className="text-xs">
              Cole a URL completa do iframe do trailer (YouTube, Vimeo, etc.)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="player_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL do Player Externo *</FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} />
            </FormControl>
            <FormDescription className="text-xs">
              Cole aqui a URL direta do vídeo (ex: https://pixeldrain.com/api/file/ID?download) ou o código iframe completo do player externo
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
