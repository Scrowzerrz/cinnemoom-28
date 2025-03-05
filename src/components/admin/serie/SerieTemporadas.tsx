
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tv, Film, PlusCircle } from "lucide-react";
import { useState } from "react";
import { GerenciarTemporadasDialog } from "./GerenciarTemporadasDialog";

interface SerieTemporadasProps {
  temporadas: any[];
  serieId?: string;
  isEditing?: boolean;
}

export function SerieTemporadas({ temporadas, serieId, isEditing = false }: SerieTemporadasProps) {
  const [dialogoAberto, setDialogoAberto] = useState(false);
  
  if (!temporadas || temporadas.length === 0) {
    return (
      <Card className="bg-movieDarkBlue/40 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Temporadas</h3>
            
            {isEditing && serieId && (
              <Button 
                onClick={() => setDialogoAberto(true)}
                variant="outline" 
                size="sm"
                className="border-movieRed text-movieRed hover:bg-movieRed hover:text-white"
              >
                <PlusCircle className="h-4 w-4 mr-1" /> Gerenciar Temporadas
              </Button>
            )}
          </div>
          
          <p className="text-gray-400 text-sm">
            {isEditing
              ? "Nenhuma temporada cadastrada. Clique em 'Gerenciar Temporadas' para adicionar."
              : "Nenhuma temporada detectada."}
          </p>
          
          {isEditing && serieId && (
            <GerenciarTemporadasDialog 
              aberto={dialogoAberto}
              fechar={() => setDialogoAberto(false)}
              serieId={serieId}
            />
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-movieDarkBlue/40 border-gray-800">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            {isEditing ? "Temporadas Cadastradas" : "Temporadas Detectadas"}
          </h3>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-movieRed text-movieRed">
              {temporadas.length} Temporada(s)
            </Badge>
            
            {isEditing && serieId && (
              <Button 
                onClick={() => setDialogoAberto(true)}
                variant="outline" 
                size="sm"
                className="border-movieRed text-movieRed hover:bg-movieRed hover:text-white"
              >
                <PlusCircle className="h-4 w-4 mr-1" /> Gerenciar Temporadas
              </Button>
            )}
          </div>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {temporadas.map((temporada) => (
            <AccordionItem 
              key={temporada.id || temporada.season_number} 
              value={`season-${temporada.season_number || temporada.numero}`}
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Tv className="h-4 w-4 text-movieRed" />
                  <span className="font-medium">
                    Temporada {temporada.season_number || temporada.numero}
                    {temporada.titulo && temporada.season_number !== temporada.titulo && ` - ${temporada.titulo}`}
                  </span>
                  {(temporada.episodes || temporada.episodios) && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {(temporada.episodes?.length || temporada.episodios?.length || 0)} episódios
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {((temporada.episodes && temporada.episodes.length > 0) || 
                  (temporada.episodios && temporada.episodios.length > 0)) ? (
                  <div className="space-y-2 mt-2">
                    {(temporada.episodes || temporada.episodios || []).map((episodio: any) => (
                      <div 
                        key={episodio.id || episodio.episode_number} 
                        className="flex items-center gap-2 p-2 bg-movieDark/50 rounded"
                      >
                        <Film className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {episodio.episode_number || episodio.numero}. {episodio.name || episodio.titulo || 'Episódio sem título'}
                          </p>
                          {(episodio.runtime || episodio.duracao) && (
                            <p className="text-xs text-gray-400">
                              {episodio.runtime 
                                ? `${Math.floor(episodio.runtime / 60)}h ${episodio.runtime % 60}min`
                                : episodio.duracao}
                            </p>
                          )}
                        </div>
                        {episodio.player_url && (
                          <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                            Player Disponível
                          </Badge>
                        )}
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
          {isEditing 
            ? "Use o botão 'Gerenciar Temporadas' para adicionar ou editar temporadas e episódios."
            : "Estas temporadas e episódios serão criados automaticamente quando a série for salva. Você poderá editar os detalhes de cada temporada e episódio posteriormente."}
        </p>
        
        {isEditing && serieId && (
          <GerenciarTemporadasDialog 
            aberto={dialogoAberto}
            fechar={() => setDialogoAberto(false)}
            serieId={serieId}
          />
        )}
      </CardContent>
    </Card>
  );
}
