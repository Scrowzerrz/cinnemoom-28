
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MovieCard, { MovieCardProps } from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { searchContent } from '@/services/movieService';

const Search = () => {
  const location = useLocation();
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('todos');
  
  // Extrair consulta de pesquisa da URL se presente
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setTermoPesquisa(query);
    }
  }, [location.search]);
  
  // Usar React Query para buscar resultados
  const { 
    data: resultadosPesquisa = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['pesquisa', termoPesquisa],
    queryFn: () => termoPesquisa ? searchContent(termoPesquisa) : Promise.resolve([]),
    enabled: termoPesquisa.length > 0
  });
  
  const realizarPesquisa = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };
  
  const obterResultadosFiltrados = () => {
    if (abaAtiva === 'todos') return resultadosPesquisa;
    if (abaAtiva === 'filmes') return resultadosPesquisa.filter(item => item.type !== 'series');
    if (abaAtiva === 'series') return resultadosPesquisa.filter(item => item.type === 'series');
    return resultadosPesquisa;
  };
  
  return (
    <div className="min-h-screen bg-movieDarkBlue">
      <Navbar />
      
      <main className="pt-20 pb-10">
        <div className="container mx-auto px-4 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-8 pt-4">Pesquisar</h1>
          
          <form onSubmit={realizarPesquisa} className="mb-10">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-5 w-5 text-movieGray" />
              </div>
              <input
                type="text"
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                className="w-full py-4 pl-10 pr-4 bg-movieDark border border-movieGray/20 rounded-md text-white placeholder:text-movieGray/60 focus:outline-none focus:ring-2 focus:ring-movieRed/50"
                placeholder="Pesquisar filmes, séries, atores..."
              />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-movieRed hover:bg-movieRed/90"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
              </Button>
            </div>
          </form>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-movieRed animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-movieDark/80 flex items-center justify-center mb-6">
                <SearchIcon className="h-10 w-10 text-movieRed" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Erro na pesquisa</h2>
              <p className="text-movieGray max-w-md">
                Ocorreu um erro ao realizar a pesquisa. Por favor, tente novamente mais tarde.
              </p>
            </div>
          ) : resultadosPesquisa.length > 0 ? (
            <>
              <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full mb-8">
                <TabsList className="bg-movieDark/60 backdrop-blur-sm">
                  <TabsTrigger value="todos" className="text-white data-[state=active]:bg-movieRed">Todos</TabsTrigger>
                  <TabsTrigger value="filmes" className="text-white data-[state=active]:bg-movieRed">Filmes</TabsTrigger>
                  <TabsTrigger value="series" className="text-white data-[state=active]:bg-movieRed">Séries</TabsTrigger>
                </TabsList>
                
                <TabsContent value="todos" className="mt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {obterResultadosFiltrados().map((item) => (
                      <div key={item.id}>
                        <MovieCard {...item} />
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="filmes" className="mt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {obterResultadosFiltrados().map((item) => (
                      <div key={item.id}>
                        <MovieCard {...item} />
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="series" className="mt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {obterResultadosFiltrados().map((item) => (
                      <div key={item.id}>
                        <MovieCard {...item} />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : termoPesquisa ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-movieDark/80 flex items-center justify-center mb-6">
                <SearchIcon className="h-10 w-10 text-movieRed" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Nenhum resultado encontrado</h2>
              <p className="text-movieGray max-w-md">
                Não encontramos nenhum resultado para "{termoPesquisa}". Tente usar termos diferentes ou mais gerais.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-movieDark/80 flex items-center justify-center mb-6">
                <SearchIcon className="h-10 w-10 text-movieGray" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Busque seus filmes e séries favoritos</h2>
              <p className="text-movieGray max-w-md">
                Digite o título de um filme ou série para começar a buscar.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Search;
