
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FilmeFormData } from "@/schemas/filmeSchema";

interface BuscadorTMDBProps {
  onFilmeEncontrado: (dados: Partial<FilmeFormData>) => void;
}

export function BuscadorTMDB({ onFilmeEncontrado }: BuscadorTMDBProps) {
  const [termoBusca, setTermoBusca] = useState("");
  const [buscando, setBuscando] = useState(false);

  const converterUrlYoutube = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const buscarFilme = async () => {
    if (!termoBusca.trim()) {
      toast.error("Digite um título para buscar");
      return;
    }

    setBuscando(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=95e5f944f39ea853d3f6569d68672ba1&language=pt-BR&query=${encodeURIComponent(
          termoBusca
        )}`
      );
      const data = await response.json();

      if (!data.results?.length) {
        toast.error("Nenhum filme encontrado");
        return;
      }

      const filmeId = data.results[0].id;
      const detalhesResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${filmeId}?api_key=95e5f944f39ea853d3f6569d68672ba1&language=pt-BR&append_to_response=credits,videos`
      );
      const detalhes = await detalhesResponse.json();

      // Encontrar o produtor(a) principal
      const produtor = detalhes.credits.crew
        .filter((pessoa: any) => pessoa.job === "Producer")
        .map((p: any) => p.name)
        .slice(0, 2)
        .join(", ");

      const dadosFilme: Partial<FilmeFormData> = {
        titulo: detalhes.title,
        ano: String(new Date(detalhes.release_date).getFullYear()),
        duracao: `${Math.floor(detalhes.runtime / 60)}h ${detalhes.runtime % 60}min`,
        descricao: detalhes.overview,
        diretor: detalhes.credits.crew.find((pessoa: any) => pessoa.job === "Director")?.name || "",
        elenco: detalhes.credits.cast.slice(0, 5).map((ator: any) => ator.name).join(", "),
        produtor: produtor || "",
        generos: detalhes.genres.map((genero: any) => genero.name),
        categoria: detalhes.genres[0]?.name || "Ação",
        qualidade: "1080p",
        poster_url: `https://image.tmdb.org/t/p/original${detalhes.poster_path}`,
        trailer_url: detalhes.videos.results[0]?.key 
          ? converterUrlYoutube(detalhes.videos.results[0].key)
          : "",
        avaliacao: (detalhes.vote_average / 2).toFixed(1),
        idioma: "Português",
        destaque: false
      };

      onFilmeEncontrado(dadosFilme);
      toast.success("Filme encontrado! Dados preenchidos automaticamente.");
    } catch (error) {
      console.error("Erro ao buscar filme:", error);
      toast.error("Erro ao buscar informações do filme");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="flex gap-2 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Digite o título do filme para buscar no TMDB..."
          className="pl-9"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && buscarFilme()}
        />
      </div>
      <Button
        type="button"
        onClick={buscarFilme}
        disabled={buscando}
        className="bg-movieRed hover:bg-red-700"
      >
        {buscando ? "Buscando..." : "Buscar"}
      </Button>
    </div>
  );
}
