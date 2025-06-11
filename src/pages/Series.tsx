
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MovieCard from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Filter, Calendar, Star, TrendingUp, FileVideo } from 'lucide-react';
import { fetchAllSeries } from '@/services/movieService';

const generos = [
  'Todos', 'Ação', 'Aventura', 'Animação', 'Comédia', 'Crime', 'Documentário', 
  'Drama', 'Família', 'Fantasia', 'História', 'Horror', 'Música', 'Mistério', 
  'Romance', 'Ficção Científica', 'Thriller', 'Guerra'
];

const Series = () => {
  const [generoSelecionado, setGeneroSelecionado] = useState('Todos');
  const [anoSelecionado, setAnoSelecionado] = useState('Todos');
  const [abaPrincipal, setAbaPrincipal] = useState('populares');
  const [pesquisa, setPesquisa] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  
  // Buscar séries usando React Query
  const { 
    data: series, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['series', abaPrincipal, generoSelecionado, anoSelecionado],
    queryFn: () => fetchAllSeries(generoSelecionado)
  });

  // Definir imagem de fundo aleatória
  useEffect(() => {
    if (series && series.length > 0) {
      const randomIndex = Math.floor(Math.random() * series.length);
      setBackgroundImage(series[randomIndex].posterUrl);
    }
  }, [series]);

  // Atualizar quando os filtros mudarem
  useEffect(() => {
    refetch();
  }, [abaPrincipal, generoSelecionado, anoSelecionado, refetch]);

  // Renderizar conteúdo baseado no estado de carregamento/erro
  const renderConteudo = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-movieRed animate-spin mx-auto mb-4" />
            <p className="text-white">Carregando séries...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-white text-2xl mb-2">Erro ao carregar séries</p>
            <p className="text-movieGray">Por favor, tente novamente mais tarde</p>
            <Button onClick={() => refetch()} className="mt-4 bg-movieRed hover:bg-movieRed/90">
              Tentar novamente
            </Button>
          </div>
        </div>
      );
    }

    if (!series || series.length === 0) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-white text-2xl mb-2">Nenhuma série encontrada</p>
            <p className="text-movieGray">Tente mudar os filtros de busca</p>
          </div>
        </div>
      );
    }

    const seriesFiltradas = pesquisa 
      ? series.filter(serie => 
          serie.title.toLowerCase().includes(pesquisa.toLowerCase())
        )
      : series;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {seriesFiltradas.map((serie) => (
          <div key={serie.id} className="transform hover:scale-105 transition-transform duration-300">
            <MovieCard {...serie} type="series" />
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background com Poster Desfocado */}
      {backgroundImage && (
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md"
            style={{ 
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              filter: 'blur(8px)',
              transform: 'scale(1.1)', // Evita bordas brancas devido ao blur
            }}
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>
      )}
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 md:mb-0">
                <span className="text-gradient bg-gradient-to-r from-white to-gray-400">Séries</span>
              </h1>
              
              <div className="relative w-full md:w-auto md:min-w-[320px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input 
                  type="text" 
                  placeholder="Buscar série..." 
                  className="w-full bg-movieDark/70 text-white border border-gray-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-movieRed/50 backdrop-blur-sm"
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs value={abaPrincipal} onValueChange={setAbaPrincipal} className="w-full mb-8">
              <TabsList className="bg-movieDark/70 backdrop-blur-md p-1 rounded-full border border-white/10 mb-6">
                <TabsTrigger 
                  value="populares" 
                  className="text-white data-[state=active]:bg-movieRed rounded-full py-2 px-4 flex items-center gap-2 transition-all duration-300"
                >
                  <Star className="h-4 w-4" /> Populares
                </TabsTrigger>
                <TabsTrigger 
                  value="recentes" 
                  className="text-white data-[state=active]:bg-movieRed rounded-full py-2 px-4 flex items-center gap-2 transition-all duration-300"
                >
                  <Calendar className="h-4 w-4" /> Recentes
                </TabsTrigger>
                <TabsTrigger 
                  value="top-rated" 
                  className="text-white data-[state=active]:bg-movieRed rounded-full py-2 px-4 flex items-center gap-2 transition-all duration-300"
                >
                  <TrendingUp className="h-4 w-4" /> Mais Avaliadas
                </TabsTrigger>
                <TabsTrigger 
                  value="novas-temporadas" 
                  className="text-white data-[state=active]:bg-movieRed rounded-full py-2 px-4 flex items-center gap-2 transition-all duration-300"
                >
                  <FileVideo className="h-4 w-4" /> Novas Temporadas
                </TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="bg-movieDark/30 p-4 rounded-xl border border-white/10 backdrop-blur-sm flex-1">
                  <div className="flex items-center gap-2 mb-2 text-white/80">
                    <Filter className="h-4 w-4" />
                    <span>Filtrar por gênero</span>
                  </div>
                  <select 
                    className="w-full bg-movieDark text-white border border-gray-700 rounded-md p-2.5"
                    value={generoSelecionado}
                    onChange={(e) => setGeneroSelecionado(e.target.value)}
                  >
                    {generos.map((genero) => (
                      <option key={genero} value={genero}>{genero}</option>
                    ))}
                  </select>
                </div>
                
                <div className="bg-movieDark/30 p-4 rounded-xl border border-white/10 backdrop-blur-sm flex-1">
                  <div className="flex items-center gap-2 mb-2 text-white/80">
                    <Calendar className="h-4 w-4" />
                    <span>Filtrar por ano</span>
                  </div>
                  <select 
                    className="w-full bg-movieDark text-white border border-gray-700 rounded-md p-2.5"
                    value={anoSelecionado}
                    onChange={(e) => setAnoSelecionado(e.target.value)}
                  >
                    <option value="Todos">Todos os anos</option>
                    {[...Array(10)].map((_, i) => {
                      const year = 2024 - i;
                      return <option key={year} value={year.toString()}>{year}</option>;
                    })}
                  </select>
                </div>
              </div>
              
              <TabsContent value="populares" className="mt-6 animate-fade-in">
                {renderConteudo()}
              </TabsContent>
              
              <TabsContent value="recentes" className="mt-6 animate-fade-in">
                {renderConteudo()}
              </TabsContent>
              
              <TabsContent value="top-rated" className="mt-6 animate-fade-in">
                {renderConteudo()}
              </TabsContent>
              
              <TabsContent value="novas-temporadas" className="mt-6 animate-fade-in">
                {renderConteudo()}
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-center mt-10">
              <Button 
                className="bg-movieRed hover:bg-movieRed/90 px-8 py-6 rounded-full text-lg font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : 'Carregar Mais'}
              </Button>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Series;
