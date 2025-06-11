
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Trash2 } from "lucide-react";
import { EpisodioDB, TemporadaDB } from "@/services/types/movieTypes";

interface GerenciarEpisodiosDialogProps {
  aberto: boolean;
  fechar: () => void;
  temporadaId: string | null;
  atualizarEpisodios: () => void;
}

export function GerenciarEpisodiosDialog({ 
  aberto, 
  fechar, 
  temporadaId,
  atualizarEpisodios
}: GerenciarEpisodiosDialogProps) {
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [temporada, setTemporada] = useState<TemporadaDB | null>(null);
  const [episodios, setEpisodios] = useState<EpisodioDB[]>([]);
  const [novoEpisodio, setNovoEpisodio] = useState({
    numero: 1,
    titulo: '',
    descricao: '',
    duracao: '',
    player_url: '',
    thumbnail_url: ''
  });

  useEffect(() => {
    if (aberto && temporadaId) {
      carregarTemporadaEEpisodios();
    }
  }, [aberto, temporadaId]);

  const carregarTemporadaEEpisodios = async () => {
    if (!temporadaId) return;
    
    setCarregando(true);
    
    try {
      // Carregar informações da temporada
      const { data: temporadaData, error: temporadaError } = await supabase
        .from('temporadas')
        .select('*')
        .eq('id', temporadaId)
        .single();
        
      if (temporadaError) throw temporadaError;
      
      setTemporada(temporadaData);
      
      // Carregar episódios existentes
      const { data: episodiosData, error: episodiosError } = await supabase
        .from('episodios')
        .select('*')
        .eq('temporada_id', temporadaId)
        .order('numero', { ascending: true });
        
      if (episodiosError) throw episodiosError;
      
      setEpisodios(episodiosData || []);
      
      // Configurar próximo número de episódio
      if (episodiosData && episodiosData.length > 0) {
        const proximoNumero = Math.max(...episodiosData.map(e => e.numero)) + 1;
        setNovoEpisodio(prev => ({ ...prev, numero: proximoNumero }));
      } else {
        setNovoEpisodio(prev => ({ ...prev, numero: 1 }));
      }
    } catch (erro) {
      console.error('Erro ao carregar temporada e episódios:', erro);
      toast.error('Erro ao carregar dados da temporada');
    } finally {
      setCarregando(false);
    }
  };

  const salvarNovoEpisodio = async () => {
    if (!temporadaId) return;
    
    if (!novoEpisodio.titulo) {
      toast.error('O título do episódio é obrigatório');
      return;
    }
    
    setSalvando(true);
    
    try {
      const { data, error } = await supabase
        .from('episodios')
        .insert([
          {
            temporada_id: temporadaId,
            numero: novoEpisodio.numero,
            titulo: novoEpisodio.titulo,
            descricao: novoEpisodio.descricao || null,
            duracao: novoEpisodio.duracao || null,
            player_url: novoEpisodio.player_url || null,
            thumbnail_url: novoEpisodio.thumbnail_url || null
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Episódio adicionado com sucesso!');
      setEpisodios([...episodios, data]);
      
      // Resetar formulário
      setNovoEpisodio({
        numero: novoEpisodio.numero + 1,
        titulo: '',
        descricao: '',
        duracao: '',
        player_url: '',
        thumbnail_url: ''
      });
      
      atualizarEpisodios();
    } catch (erro) {
      console.error('Erro ao adicionar episódio:', erro);
      toast.error('Erro ao adicionar episódio');
    } finally {
      setSalvando(false);
    }
  };
  
  const atualizarEpisodio = async (id: string, campo: string, valor: string) => {
    try {
      const { error } = await supabase
        .from('episodios')
        .update({ [campo]: valor })
        .eq('id', id);
        
      if (error) throw error;
      
      setEpisodios(episodios.map(ep => 
        ep.id === id ? { ...ep, [campo]: valor } : ep
      ));
      
      toast.success('Episódio atualizado com sucesso!');
      atualizarEpisodios();
    } catch (erro) {
      console.error('Erro ao atualizar episódio:', erro);
      toast.error('Erro ao atualizar episódio');
    }
  };
  
  const excluirEpisodio = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este episódio?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('episodios')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setEpisodios(episodios.filter(ep => ep.id !== id));
      toast.success('Episódio excluído com sucesso!');
      atualizarEpisodios();
    } catch (erro) {
      console.error('Erro ao excluir episódio:', erro);
      toast.error('Erro ao excluir episódio');
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={fechar}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-movieDark text-white">
        <DialogHeader>
          <DialogTitle>
            {temporada ? `Gerenciar Episódios - ${temporada.titulo || `Temporada ${temporada.numero}`}` : 'Gerenciar Episódios'}
          </DialogTitle>
        </DialogHeader>
        
        {carregando ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-movieRed" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : (
          <>
            {/* Lista de episódios existentes */}
            {episodios.length > 0 ? (
              <div className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Episódios Existentes</h3>
                {episodios.map(episodio => (
                  <div key={episodio.id} className="border border-gray-700 rounded-md p-4 bg-gray-900">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">
                        Episódio {episodio.numero}: {episodio.titulo}
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => excluirEpisodio(episodio.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor={`titulo-${episodio.id}`}>Título</Label>
                        <Input
                          id={`titulo-${episodio.id}`}
                          value={episodio.titulo}
                          onChange={(e) => atualizarEpisodio(episodio.id, 'titulo', e.target.value)}
                          className="bg-gray-800"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`duracao-${episodio.id}`}>Duração</Label>
                        <Input
                          id={`duracao-${episodio.id}`}
                          value={episodio.duracao || ''}
                          onChange={(e) => atualizarEpisodio(episodio.id, 'duracao', e.target.value)}
                          placeholder="Ex: 1h 30min"
                          className="bg-gray-800"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor={`descricao-${episodio.id}`}>Descrição</Label>
                        <Textarea
                          id={`descricao-${episodio.id}`}
                          value={episodio.descricao || ''}
                          onChange={(e) => atualizarEpisodio(episodio.id, 'descricao', e.target.value)}
                          className="bg-gray-800"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor={`player-${episodio.id}`} className="text-movieRed font-medium">
                          URL do Player
                        </Label>
                        <Input
                          id={`player-${episodio.id}`}
                          value={episodio.player_url || ''}
                          onChange={(e) => atualizarEpisodio(episodio.id, 'player_url', e.target.value)}
                          placeholder="URL de embed do player"
                          className="bg-gray-800"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor={`thumbnail-${episodio.id}`}>URL da Thumbnail</Label>
                        <Input
                          id={`thumbnail-${episodio.id}`}
                          value={episodio.thumbnail_url || ''}
                          onChange={(e) => atualizarEpisodio(episodio.id, 'thumbnail_url', e.target.value)}
                          placeholder="URL da imagem de thumbnail"
                          className="bg-gray-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                Nenhum episódio cadastrado para esta temporada.
              </div>
            )}
            
            {/* Formulário para adicionar novo episódio */}
            <div className="mt-8 border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4">Adicionar Novo Episódio</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero">Número do Episódio</Label>
                  <Input
                    id="numero"
                    type="number"
                    min="1"
                    value={novoEpisodio.numero}
                    onChange={(e) => setNovoEpisodio({...novoEpisodio, numero: parseInt(e.target.value)})}
                    className="bg-gray-800"
                  />
                </div>
                
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={novoEpisodio.titulo}
                    onChange={(e) => setNovoEpisodio({...novoEpisodio, titulo: e.target.value})}
                    placeholder="Título do episódio"
                    className="bg-gray-800"
                  />
                </div>
                
                <div>
                  <Label htmlFor="duracao">Duração</Label>
                  <Input
                    id="duracao"
                    value={novoEpisodio.duracao}
                    onChange={(e) => setNovoEpisodio({...novoEpisodio, duracao: e.target.value})}
                    placeholder="Ex: 1h 30min"
                    className="bg-gray-800"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={novoEpisodio.descricao}
                    onChange={(e) => setNovoEpisodio({...novoEpisodio, descricao: e.target.value})}
                    placeholder="Descrição do episódio"
                    className="bg-gray-800"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="player_url" className="text-movieRed font-medium">URL do Player</Label>
                  <Input
                    id="player_url"
                    value={novoEpisodio.player_url}
                    onChange={(e) => setNovoEpisodio({...novoEpisodio, player_url: e.target.value})}
                    placeholder="URL de embed do player"
                    className="bg-gray-800"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="thumbnail_url">URL da Thumbnail</Label>
                  <Input
                    id="thumbnail_url"
                    value={novoEpisodio.thumbnail_url}
                    onChange={(e) => setNovoEpisodio({...novoEpisodio, thumbnail_url: e.target.value})}
                    placeholder="URL da imagem de thumbnail"
                    className="bg-gray-800"
                  />
                </div>
              </div>
            </div>
          </>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={fechar}>Cancelar</Button>
          <Button 
            onClick={salvarNovoEpisodio} 
            disabled={carregando || salvando || !novoEpisodio.titulo}
            className="bg-movieRed hover:bg-movieRed/90"
          >
            {salvando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Adicionar Episódio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
