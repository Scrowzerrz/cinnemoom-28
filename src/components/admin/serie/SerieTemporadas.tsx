
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tv, Film } from "lucide-react";

interface SerieTemporadasProps {
  temporadas: any[];
}

export function SerieTemporadas({ temporadas }: SerieTemporadasProps) {
  if (!temporadas || temporadas.length === 0) {
    return null;
  }
  
  return (
    <Card className="bg-movieDarkBlue/40 border-gray-800">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Temporadas Detectadas</h3>
          <Badge variant="outline" className="border-movieRed text-movieRed">
            {temporadas.length} Temporada(s)
          </Badge>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {temporadas.map((temporada) => (
            <AccordionItem key={temporada.id || temporada.season_number} value={`season-${temporada.season_number}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Tv className="h-4 w-4 text-movieRed" />
                  <span className="font-medium">
                    Temporada {temporada.season_number}
                  </span>
                  {temporada.episodes && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {temporada.episodes.length} episódios
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {temporada.episodes && temporada.episodes.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {temporada.episodes.map((episodio: any) => (
                      <div 
                        key={episodio.id || episodio.episode_number} 
                        className="flex items-center gap-2 p-2 bg-movieDark/50 rounded"
                      >
                        <Film className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {episodio.episode_number}. {episodio.name || 'Episódio sem título'}
                          </p>
                          {episodio.runtime && (
                            <p className="text-xs text-gray-400">
                              {Math.floor(episodio.runtime / 60)}h {episodio.runtime % 60}min
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Nenhum episódio detectado para esta temporada.
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <p className="text-sm text-gray-400 mt-4">
          Estas temporadas e episódios serão criados automaticamente quando a série for salva.
          Você poderá editar os detalhes de cada temporada e episódio posteriormente.
        </p>
      </CardContent>
    </Card>
  );
}
