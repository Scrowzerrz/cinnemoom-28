
import { useState } from "react";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SerieFormData } from "@/schemas/serieSchema";
import { Card } from "@/components/ui/card";

interface BuscadorTMDBSeriesProps {
  onSerieEncontrada: (dados: Partial<SerieFormData>, temporadas?: any[]) => void;
}

export function BuscadorTMDBSeries({ onSerieEncontrada }: BuscadorTMDBSeriesProps) {
  const [termoBusca, setTermoBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [series, setSeries] = useState<any[]>([]);
  const [serieSelecionada, setSerieSelecionada] = useState<any>(null);
  const [temporadas, setTemporadas] = useState<any[]>([]);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  const converterUrlYoutube = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const buscarSeries = async () => {
    if (!termoBusca.trim()) {
      toast.error("Digite um título para buscar");
      return;
    }

    setBuscando(true);
    setSeries([]);
    setSerieSelecionada(null);
    setTemporadas([]);
    
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=95e5f944f39ea853d3f6569d68672ba1&language=pt-BR&query=${encodeURIComponent(
          termoBusca
        )}`
      );
      const data = await response.json();

      if (!data.results?.length) {
        toast.error("Nenhuma série encontrada");
        return;
      }

      setSeries(data.results.slice(0, 5));
      
    } catch (error) {
      console.error("Erro ao buscar séries:", error);
      toast.error("Erro ao buscar informações da série");
    } finally {
      setBuscando(false);
    }
  };
  
  const carregarDetalhesSerie = async (serie: any) => {
    setCarregandoDetalhes(true);
    setSerieSelecionada(serie);
    setTemporadas([]);
    
    try {
      const serieId = serie.id;
      const detalhesResponse = await fetch(
        `https://api.themoviedb.org/3/tv/${serieId}?api_key=95e5f944f39ea853d3f6569d68672ba1&language=pt-BR&append_to_response=credits,videos,seasons`
      );
      const detalhes = await detalhesResponse.json();
      
      // Carregar informações detalhadas de cada temporada, incluindo episódios
      const temporadasDetalhadas = [];
      for (const temporada of detalhes.seasons) {
        if (temporada.season_number === 0) continue; // Pular temporadas "especiais" (0)
        
        const tempResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${serieId}/season/${temporada.season_number}?api_key=95e5f944f39ea853d3f6569d68672ba1&language=pt-BR`
        );
        const tempDetalhes = await tempResponse.json();
        temporadasDetalhadas.push(tempDetalhes);
      }
      
      setTemporadas(temporadasDetalhadas);

      // Encontrar o produtor(a) principal
      const produtor = detalhes.credits.crew
        .filter((pessoa: any) => pessoa.job === "Producer" || pessoa.job === "Executive Producer")
        .map((p: any) => p.name)
        .slice(0, 2)
        .join(", ");

      const dadosSerie: Partial<SerieFormData> = {
        titulo: detalhes.name,
        titulo_original: detalhes.original_name !== detalhes.name ? detalhes.original_name : '',
        ano: detalhes.first_air_date ? String(new Date(detalhes.first_air_date).getFullYear()) : '',
        duracao: detalhes.episode_run_time?.length > 0 ? `${detalhes.episode_run_time[0]}min` : '',
        descricao: detalhes.overview,
        diretor: detalhes.created_by?.map((criador: any) => criador.name).join(", ") || '',
        elenco: detalhes.credits.cast.slice(0, 5).map((ator: any) => ator.name).join(", "),
        produtor: produtor || "",
        generos: detalhes.genres.map((genero: any) => genero.name),
        categoria: detalhes.genres[0]?.name || "Drama",
        qualidade: "1080p",
        poster_url: `https://image.tmdb.org/t/p/original${detalhes.poster_path}`,
        trailer_url: detalhes.videos?.results?.[0]?.key 
          ? converterUrlYoutube(detalhes.videos.results[0].key)
          : "",
        avaliacao: (detalhes.vote_average / 2).toFixed(1),
        idioma: "Português",
        destaque: false
      };

      onSerieEncontrada(dadosSerie, temporadasDetalhadas);
      toast.success("Série encontrada! Dados preenchidos automaticamente.");
    } catch (error) {
      console.error("Erro ao carregar detalhes da série:", error);
      toast.error("Erro ao carregar informações completas da série");
    } finally {
      setCarregandoDetalhes(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Digite o título da série para buscar no TMDB..."
            className="pl-9"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && buscarSeries()}
          />
        </div>
        <Button
          type="button"
          onClick={buscarSeries}
          disabled={buscando}
          className="bg-movieRed hover:bg-red-700"
        >
          {buscando ? "Buscando..." : "Buscar"}
        </Button>
      </div>
      
      {series.length > 0 && !serieSelecionada && (
        <Card className="p-4 bg-movieDarkBlue/40 border-gray-800">
          <h3 className="font-medium mb-3">Resultados da Busca</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {series.map((serie) => (
              <div 
                key={serie.id} 
                className="flex items-center gap-3 p-2 hover:bg-movieDark/80 rounded cursor-pointer"
                onClick={() => carregarDetalhesSerie(serie)}
              >
                {serie.poster_path ? (
                  <img 
                    src={`https://image.tmdb.org/t/p/w92${serie.poster_path}`} 
                    alt={serie.name} 
                    className="w-10 h-14 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-400">Sem imagem</span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{serie.name}</h4>
                  <p className="text-sm text-gray-400">
                    {serie.first_air_date ? new Date(serie.first_air_date).getFullYear() : 'Ano desconhecido'}
                    {serie.original_name !== serie.name && ` • ${serie.original_name}`}
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="bg-movieRed/20 hover:bg-movieRed/40 text-movieRed"
                  disabled={carregandoDetalhes}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Importar
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {serieSelecionada && temporadas.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-800/50 rounded">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <p className="text-sm text-green-400">
            Série "{serieSelecionada.name}" carregada com sucesso! {temporadas.length} temporada(s) detectada(s).
          </p>
        </div>
      )}
    </div>
  );
}
