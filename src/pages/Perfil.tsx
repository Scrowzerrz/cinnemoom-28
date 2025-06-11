
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Camera, Heart, Film, Tv } from 'lucide-react';
import { useFavoritos } from '@/hooks/useFavoritos';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/Navbar';
import CartaoFilme from '@/components/MovieCard';

interface FavoritoComDetalhes {
  id: string;
  item_id: string;
  tipo: 'filme' | 'serie';
  detalhes: {
    id: string;
    titulo: string;
    poster_url: string;
    ano: string;
    duracao?: string;
    avaliacao?: string;
  } | null;
}

const Perfil = () => {
  const { perfil, refreshPerfil } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState(perfil?.nome || '');
  const [carregando, setCarregando] = useState(false);
  const [carregandoImagem, setCarregandoImagem] = useState(false);
  const { favoritos, isLoading: carregandoFavoritos } = useFavoritos();
  const [favoritosComDetalhes, setFavoritosComDetalhes] = useState<FavoritoComDetalhes[]>([]);
  const [tipoFavoritoAtivo, setTipoFavoritoAtivo] = useState<'todos' | 'filmes' | 'series'>('todos');

  useEffect(() => {
    const buscarDetalhesFavoritos = async () => {
      if (!favoritos.length) return;

      try {
        const detalhes = await Promise.all(
          favoritos.map(async (fav) => {
            const tabela = fav.tipo === 'filme' ? 'filmes' : 'series';
            const { data, error } = await supabase
              .from(tabela)
              .select('id, titulo, poster_url, ano, duracao, avaliacao')
              .eq('id', fav.item_id)
              .maybeSingle();

            if (error) throw error;

            return {
              ...fav,
              detalhes: data
            };
          })
        );

        setFavoritosComDetalhes(detalhes);
      } catch (error) {
        console.error('Erro ao buscar detalhes dos favoritos:', error);
        toast.error('Não foi possível carregar os detalhes dos seus favoritos');
      }
    };

    buscarDetalhesFavoritos();
  }, [favoritos]);

  const getFavoritosFiltrados = () => {
    if (tipoFavoritoAtivo === 'todos') return favoritosComDetalhes;
    return favoritosComDetalhes.filter(
      fav => tipoFavoritoAtivo === 'filmes' ? fav.tipo === 'filme' : fav.tipo === 'serie'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!perfil) {
      toast.error('Usuário não autenticado');
      return;
    }
    
    try {
      setCarregando(true);
      
      const { error } = await supabase
        .from('perfis')
        .update({ nome })
        .eq('id', perfil.id);
      
      if (error) {
        throw error;
      }
      
      await refreshPerfil();
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setCarregando(false);
    }
  };

  const handleImagemUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !perfil) return;
    
    try {
      setCarregandoImagem(true);
      
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Imagem muito grande. Máximo de 2MB.');
        return;
      }
      
      // Se existe um avatar antigo, vamos extrair o nome do arquivo da URL
      if (perfil.avatar_url) {
        const oldFilePath = perfil.avatar_url.split('/').pop();
        if (oldFilePath) {
          // Tentar remover o arquivo antigo
          const { error: deleteError } = await supabase
            .storage
            .from('perfis')
            .remove([oldFilePath]);
          
          if (deleteError) {
            console.error('Erro ao deletar avatar antigo:', deleteError);
          }
        }
      }
      
      // Gerar nome de arquivo único
      const fileExt = file.name.split('.').pop();
      const fileName = `${perfil.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Fazer upload para o Storage
      const { error: uploadError, data: uploadData } = await supabase
        .storage
        .from('perfis')
        .upload(filePath, file, {
          upsert: true
        });
      
      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        throw uploadError;
      }
      
      // Obter URL pública do arquivo
      const { data } = supabase
        .storage
        .from('perfis')
        .getPublicUrl(filePath);
      
      // Atualizar perfil do usuário com a nova URL
      const { error: updateError } = await supabase
        .from('perfis')
        .update({ avatar_url: data.publicUrl })
        .eq('id', perfil.id);
      
      if (updateError) {
        console.error('Erro ao atualizar URL do avatar:', updateError);
        throw updateError;
      }
      
      await refreshPerfil();
      toast.success('Imagem de perfil atualizada!');
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast.error('Erro ao atualizar imagem de perfil');
    } finally {
      setCarregandoImagem(false);
    }
  };

  if (!perfil) {
    navigate('/auth');
    return null;
  }

  const renderConteudoFavoritos = () => {
    if (carregandoFavoritos) {
      return (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 text-movieRed animate-spin" />
        </div>
      );
    }

    const favoritosFiltrados = getFavoritosFiltrados();

    if (favoritosFiltrados.length === 0) {
      let mensagem = 'Nenhum favorito encontrado';
      if (tipoFavoritoAtivo === 'filmes') {
        mensagem = 'Nenhum filme adicionado aos favoritos';
      } else if (tipoFavoritoAtivo === 'series') {
        mensagem = 'Nenhuma série adicionada aos favoritos';
      }

      return (
        <div className="text-center py-10 text-gray-400">
          <Heart className="h-16 w-16 mx-auto mb-4 text-movieGray/40" />
          <p className="text-xl font-medium mb-2">{mensagem}</p>
          <p>Adicione {tipoFavoritoAtivo === 'todos' ? 'filmes e séries' : tipoFavoritoAtivo === 'filmes' ? 'filmes' : 'séries'} aos seus favoritos para vê-los aqui.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {favoritosFiltrados.map((fav) => (
          fav.detalhes && (
            <CartaoFilme
              key={fav.id}
              id={fav.item_id}
              title={fav.detalhes.titulo}
              posterUrl={fav.detalhes.poster_url}
              year={fav.detalhes.ano}
              duration={fav.detalhes.duracao}
              rating={fav.detalhes.avaliacao}
              type={fav.tipo === 'serie' ? 'series' : 'movie'}
            />
          )
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-movieDarkBlue to-movieDark pt-24 px-4 pb-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 border-l-4 border-movieRed pl-4">
            Meu Perfil
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Coluna de avatar */}
            <Card className="bg-movieDark/80 border-movieGray/20 backdrop-blur shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Foto de Perfil</CardTitle>
                <CardDescription className="text-gray-400">
                  Sua foto pública no Cineflix
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Avatar className="h-32 w-32 border-2 border-white/10">
                    <AvatarImage src={perfil.avatar_url || ''} />
                    <AvatarFallback className="bg-movieRed text-white text-3xl">
                      {perfil.nome ? perfil.nome.substring(0, 2).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute -bottom-2 -right-2 p-2 bg-movieRed text-white rounded-full cursor-pointer hover:bg-red-600 transition-colors"
                  >
                    {carregandoImagem ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                    <input 
                      type="file" 
                      id="avatar-upload" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImagemUpload}
                      disabled={carregandoImagem}
                    />
                  </label>
                </div>
                <p className="text-center text-sm text-gray-400 max-w-xs">
                  Clique no ícone da câmera para alterar sua foto. Imagens menores que 2MB.
                </p>
              </CardContent>
            </Card>
            
            {/* Coluna de informações */}
            <Card className="bg-movieDark/80 border-movieGray/20 backdrop-blur shadow-xl md:col-span-2">
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle className="text-white">Informações da Conta</CardTitle>
                  <CardDescription className="text-gray-400">
                    Atualize suas informações pessoais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-white">Nome</Label>
                    <Input 
                      id="nome" 
                      value={nome} 
                      onChange={(e) => setNome(e.target.value)}
                      className="bg-movieDarkBlue/70 border-movieGray/30 text-white focus-visible:ring-movieRed/50 focus-visible:border-movieRed/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input 
                      id="email" 
                      value={perfil.email} 
                      disabled
                      className="bg-movieDarkBlue/50 border-movieGray/30 text-gray-400"
                    />
                    <p className="text-xs text-gray-500">
                      O email não pode ser alterado
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-movieRed hover:bg-red-700 text-white shadow-md"
                    disabled={carregando}
                  >
                    {carregando ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
          
          {/* Seção de Favoritos */}
          <div className="mt-12">
            <div className="flex items-center mb-6">
              <Heart className="h-6 w-6 text-movieRed mr-3" />
              <h2 className="text-2xl font-bold text-white">Meus Favoritos</h2>
            </div>
            
            <Card className="bg-movieDark/80 border-movieGray/20 backdrop-blur shadow-xl">
              <CardContent className="pt-6">
                <Tabs defaultValue="todos" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger 
                      value="todos" 
                      onClick={() => setTipoFavoritoAtivo('todos')}
                    >
                      Todos
                    </TabsTrigger>
                    <TabsTrigger 
                      value="filmes" 
                      onClick={() => setTipoFavoritoAtivo('filmes')}
                    >
                      <Film className="h-4 w-4 mr-1" /> 
                      Filmes
                    </TabsTrigger>
                    <TabsTrigger 
                      value="series" 
                      onClick={() => setTipoFavoritoAtivo('series')}
                    >
                      <Tv className="h-4 w-4 mr-1" /> 
                      Séries
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="todos" className="mt-0">
                    {renderConteudoFavoritos()}
                  </TabsContent>
                  
                  <TabsContent value="filmes" className="mt-0">
                    {renderConteudoFavoritos()}
                  </TabsContent>
                  
                  <TabsContent value="series" className="mt-0">
                    {renderConteudoFavoritos()}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Perfil;
