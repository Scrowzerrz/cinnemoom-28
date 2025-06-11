import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchMovieDetails, incrementarVisualizacaoFilme } from '@/services/filmesService';
import { fetchSomeMovies } from '@/services/movieService';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useAuth } from '@/hooks/useAuth';
import { MovieResponse } from '@/services/types/movieTypes';

import FilmeHeader from '@/components/filme/FilmeHeader';
import FilmeAssistir from '@/components/filme/FilmeAssistir';
import FilmeComentarios from '@/components/filme/FilmeComentarios';
import VejaTambemSection from '@/components/filme/VejaTambemSection';

const DetalhesFilme = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('assistir');
  const [isTrailer, setIsTrailer] = useState(false);
  const navigate = useNavigate();
  const { perfil } = useAuth();
  const { favoritos, adicionarFavorito, removerFavorito } = useFavoritos();
  
  const isFavorito = favoritos.some(f => f.item_id === id);
  
  const { 
    data: filme, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['filme-detalhes', id],
    queryFn: () => fetchMovieDetails(id || ''),
    enabled: !!id
  });

  const { 
    data: filmesSugestoes = [],
    isLoading: isLoadingSugestoes
  } = useQuery({
    queryKey: ['filmes-sugestoes'],
    queryFn: () => fetchSomeMovies(5),
  });

  useEffect(() => {
    if (id) {
      incrementarVisualizacaoFilme(id).catch(erro => 
        console.error("Erro ao registrar visualização do filme:", erro)
      );
    }
  }, [id]);

  const handleFavoritoClick = async () => {
    if (!perfil) {
      navigate('/auth');
      return;
    }

    if (isFavorito) {
      await removerFavorito.mutateAsync(id || '');
    } else {
      await adicionarFavorito.mutateAsync({ itemId: id || '', tipo: 'filme' });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="h-12 w-12 text-movieRed animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !filme) {
    return (
      <div className="bg-black min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <h2 className="text-white text-2xl mb-2">Filme não encontrado</h2>
            <p className="text-movieGray mb-6">Não foi possível encontrar o filme solicitado</p>
            <Link to="/movies">
              <Button className="bg-movieRed hover:bg-movieRed/90">
                Voltar para filmes
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      
      <FilmeHeader 
        filme={filme} 
        setActiveTab={setActiveTab} 
        setIsTrailer={setIsTrailer} 
      />
      
      <div className="bg-black">
        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-gray-900 border border-gray-800 mb-6 p-1 overflow-x-auto flex w-full scrollbar-none">
              <TabsTrigger 
                value="assistir" 
                className="flex-1 text-gray-300 data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-md text-sm py-2"
              >
                Assistir
              </TabsTrigger>
              <TabsTrigger 
                value="comentarios" 
                className="flex-1 text-gray-300 data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-md text-sm py-2"
              >
                Comentários
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="assistir" className="mt-6 focus-visible:outline-none">
              <FilmeAssistir 
                filme={filme} 
                isTrailer={isTrailer} 
                setIsTrailer={setIsTrailer} 
                handleFavoritoClick={handleFavoritoClick} 
                isFavorito={isFavorito} 
              />
              
              <VejaTambemSection 
                filmes={filmesSugestoes} 
                isLoading={isLoadingSugestoes} 
              />
            </TabsContent>
            
            <TabsContent value="comentarios" className="mt-6 focus-visible:outline-none">
              <FilmeComentarios filmeId={filme.id} />
              
              <VejaTambemSection 
                filmes={filmesSugestoes} 
                isLoading={isLoadingSugestoes} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DetalhesFilme;
