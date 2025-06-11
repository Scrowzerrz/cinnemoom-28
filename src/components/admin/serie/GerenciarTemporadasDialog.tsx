
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Trash2, Film } from "lucide-react";
import { TemporadaDB } from "@/services/types/movieTypes";
import { GerenciarEpisodiosDialog } from "./GerenciarEpisodiosDialog";

interface GerenciarTemporadasDialogProps {
  aberto: boolean;
  fechar: () => void;
  serieId: string | null;
}

export function GerenciarTemporadasDialog({ aberto, fechar, serieId }: GerenciarTemporadasDialogProps) {
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [temporadas, setTemporadas] = useState<TemporadaDB[]>([]);
  const [temporadaSelecionada, setTemporadaSelecionada] = useState<string | null>(null);
  const [dialogoEpisodiosAberto, setDialogoEpisodiosAberto] = useState(false);
  const [novaTemporada, setNovaTemporada] = useState({
    numero: 1,
    titulo: '',
    ano: '',
    poster_url: ''
  });

  useEffect(() => {
    if (aberto && serieId) {
      carregarTemporadas();
    }
  }, [aberto, serieId]);

  const carregarTemporadas = async () => {
    if (!serieId) return;
    
    setCarregando(true);
    
    try {
      const { data, error } = await supabase
        .from('temporadas')
        .select('*')
        .eq('serie_id', serieId)
        .order('numero', { ascending: true });
        
      if (error) throw error;
      
      setTemporadas(data || []);
      
      // Configurar próximo número de temporada
      if (data && data.length > 0) {
        const proximoNumero = Math.max(...data.map(t => t.numero)) + 1;
        setNovaTemporada(prev => ({ ...prev, numero: proximoNumero }));
      } else {
        setNovaTemporada(prev => ({ ...prev, numero: 1 }));
      }
    } catch (erro) {
      console.error('Erro ao carregar temporadas:', erro);
      toast.error('Erro ao carregar temporadas');
    } finally {
      setCarregando(false);
    }
  };

  const salvarNovaTemporada = async () => {
    if (!serieId) return;
    
    if (!novaTemporada.titulo) {
      toast.error('O título da temporada é obrigatório');
      return;
    }
    
    setSalvando(true);
    
    try {
      const { data, error } = await supabase
        .from('temporadas')
        .insert([
          {
            serie_id: serieId,
            numero: novaTemporada.numero,
            titulo: novaTemporada.titulo,
            ano: novaTemporada.ano || null,
            poster_url: novaTemporada.poster_url || null
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Temporada adicionada com sucesso!');
      setTemporadas([...temporadas, data]);
      
      // Resetar formulário
      setNovaTemporada({
        numero: novaTemporada.numero + 1,
        titulo: '',
        ano: '',
        poster_url: ''
      });
    } catch (erro) {
      console.error('Erro ao adicionar temporada:', erro);
      toast.error('Erro ao adicionar temporada');
    } finally {
      setSalvando(false);
    }
  };
  
  const atualizarTemporada = async (id: string, campo: string, valor: string) => {
    try {
      const { error } = await supabase
        .from('temporadas')
        .update({ [campo]: valor })
        .eq('id', id);
        
      if (error) throw error;
      
      setTemporadas(temporadas.map(temp => 
        temp.id === id ? { ...temp, [campo]: valor } : temp
      ));
      
      toast.success('Temporada atualizada com sucesso!');
    } catch (erro) {
      console.error('Erro ao atualizar temporada:', erro);
      toast.error('Erro ao atualizar temporada');
    }
  };
  
  const excluirTemporada = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta temporada? Todos os episódios serão excluídos!')) {
      return;
    }
    
    try {
      // Primeiro excluir todos os episódios
      const { error: episodioError } = await supabase
        .from('episodios')
        .delete()
        .eq('temporada_id', id);
        
      if (episodioError) throw episodioError;
      
      // Depois excluir a temporada
      const { error } = await supabase
        .from('temporadas')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setTemporadas(temporadas.filter(temp => temp.id !== id));
      toast.success('Temporada excluída com sucesso!');
    } catch (erro) {
      console.error('Erro ao excluir temporada:', erro);
      toast.error('Erro ao excluir temporada');
    }
  };
  
  const abrirGerenciadorEpisodios = (temporadaId: string) => {
    setTemporadaSelecionada(temporadaId);
    setDialogoEpisodiosAberto(true);
  };

  return (
    <>
      <Dialog open={aberto} onOpenChange={fechar}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-movieDark text-white">
          <DialogHeader>
            <DialogTitle>Gerenciar Temporadas</DialogTitle>
          </DialogHeader>
          
          {carregando ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-movieRed" />
              <span className="ml-2">Carregando temporadas...</span>
            </div>
          ) : (
            <>
              {/* Lista de temporadas existentes */}
              {temporadas.length > 0 ? (
                <div className="space-y-4 mt-4">
                  <h3 className="text-lg font-semibold">Temporadas Existentes</h3>
                  {temporadas.map(temporada => (
                    <div key={temporada.id} className="border border-gray-700 rounded-md p-4 bg-gray-900">
                      <div className="flex justify-between items-start">
                        <div className="font-medium">
                          Temporada {temporada.numero}: {temporada.titulo}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => abrirGerenciadorEpisodios(temporada.id)}
                            className="border-movieRed text-movieRed hover:bg-movieRed hover:text-white"
                          >
                            <Film className="h-4 w-4 mr-1" />
                            Episódios
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => excluirTemporada(temporada.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label htmlFor={`titulo-${temporada.id}`}>Título</Label>
                          <Input
                            id={`titulo-${temporada.id}`}
                            value={temporada.titulo || ''}
                            onChange={(e) => atualizarTemporada(temporada.id, 'titulo', e.target.value)}
                            className="bg-gray-800"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`ano-${temporada.id}`}>Ano</Label>
                          <Input
                            id={`ano-${temporada.id}`}
                            value={temporada.ano || ''}
                            onChange={(e) => atualizarTemporada(temporada.id, 'ano', e.target.value)}
                            placeholder="Ex: 2023"
                            className="bg-gray-800"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label htmlFor={`poster-${temporada.id}`}>URL do Poster</Label>
                          <Input
                            id={`poster-${temporada.id}`}
                            value={temporada.poster_url || ''}
                            onChange={(e) => atualizarTemporada(temporada.id, 'poster_url', e.target.value)}
                            placeholder="URL da imagem do poster"
                            className="bg-gray-800"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  Nenhuma temporada cadastrada para esta série.
                </div>
              )}
              
              {/* Formulário para adicionar nova temporada */}
              <div className="mt-8 border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-4">Adicionar Nova Temporada</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numero">Número da Temporada</Label>
                    <Input
                      id="numero"
                      type="number"
                      min="1"
                      value={novaTemporada.numero}
                      onChange={(e) => setNovaTemporada({...novaTemporada, numero: parseInt(e.target.value)})}
                      className="bg-gray-800"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      value={novaTemporada.titulo}
                      onChange={(e) => setNovaTemporada({...novaTemporada, titulo: e.target.value})}
                      placeholder="Ex: Temporada 1"
                      className="bg-gray-800"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="ano">Ano</Label>
                    <Input
                      id="ano"
                      value={novaTemporada.ano}
                      onChange={(e) => setNovaTemporada({...novaTemporada, ano: e.target.value})}
                      placeholder="Ex: 2023"
                      className="bg-gray-800"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="poster_url">URL do Poster</Label>
                    <Input
                      id="poster_url"
                      value={novaTemporada.poster_url}
                      onChange={(e) => setNovaTemporada({...novaTemporada, poster_url: e.target.value})}
                      placeholder="URL da imagem do poster"
                      className="bg-gray-800"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={fechar}>Fechar</Button>
            <Button 
              onClick={salvarNovaTemporada} 
              disabled={carregando || salvando || !novaTemporada.titulo}
              className="bg-movieRed hover:bg-movieRed/90"
            >
              {salvando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Adicionar Temporada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para gerenciar episódios da temporada selecionada */}
      <GerenciarEpisodiosDialog 
        aberto={dialogoEpisodiosAberto}
        fechar={() => setDialogoEpisodiosAberto(false)}
        temporadaId={temporadaSelecionada}
        atualizarEpisodios={carregarTemporadas}
      />
    </>
  );
}
