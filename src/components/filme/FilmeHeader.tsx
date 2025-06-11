import { useNavigate } from 'react-router-dom';
import { Play, Plus, Download, Share2, Film, Users, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { MovieResponse } from '@/services/types/movieTypes';
import { toast } from 'sonner';
import FavoritoButton from '@/components/FavoritoButton';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useAuth } from '@/hooks/useAuth';

interface FilmeHeaderProps {
  filme: MovieResponse;
  setActiveTab: (tab: string) => void;
  setIsTrailer: (isTrailer: boolean) => void;
}

const FilmeHeader = ({ filme, setActiveTab, setIsTrailer }: FilmeHeaderProps) => {
  const navigate = useNavigate();
  const { perfil } = useAuth();
  const { favoritos, adicionarFavorito, removerFavorito } = useFavoritos();
  
  const isFavorito = favoritos.some(f => f.item_id === filme.id);
  
  const compartilharFilme = () => {
    if (navigator.share) {
      navigator.share({
        title: filme?.titulo || 'Filme',
        text: `Assista ${filme?.titulo} em nossa plataforma de streaming`,
        url: window.location.href
      })
      .catch((err) => {
        console.error('Erro ao compartilhar:', err);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  const handleFavoritoClick = async () => {
    if (!perfil) {
      navigate('/auth');
      return;
    }

    if (isFavorito) {
      await removerFavorito.mutateAsync(filme.id || '');
    } else {
      await adicionarFavorito.mutateAsync({ itemId: filme.id || '', tipo: 'filme' });
    }
  };

  const baixarFilme = () => {
    toast.info('Iniciando download...');
  };
  
  const formattedRating = filme.avaliacao ? `${filme.avaliacao}/10` : '0/10';

  return (
    <div 
      className="relative w-full bg-black pt-16"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.9) 100%), url(${filme.poster_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="rounded-md overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-gray-800">
              <img 
                src={filme.poster_url} 
                alt={filme.titulo} 
                className="w-full h-auto object-cover"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 md:hidden">
              <Button 
                className="w-full bg-movieRed hover:bg-movieRed/90 text-white rounded-md"
                onClick={() => {
                  setActiveTab('assistir');
                  setIsTrailer(false);
                }}
              >
                <Play className="mr-2 h-4 w-4 fill-white" /> Assistir
              </Button>
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-700 text-white bg-black/50 hover:bg-gray-800"
                  onClick={() => {
                    setActiveTab('assistir');
                    setIsTrailer(true);
                  }}
                >
                  <Play className="h-4 w-4" /> Trailer
                </Button>
                <Button 
                  variant="outline"
                  className="border-gray-700 text-white bg-black/50 hover:bg-gray-800"
                  onClick={handleFavoritoClick}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline"
                  className="border-gray-700 text-white bg-black/50 hover:bg-gray-800"
                  onClick={baixarFilme}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{filme.titulo}</h1>
              <p className="text-gray-400 text-sm">{filme.titulo_original || filme.titulo}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge className="bg-gray-800 text-white hover:bg-gray-700">{filme.ano}</Badge>
              <Badge className="bg-gray-800 text-white hover:bg-gray-700">{filme.duracao}</Badge>
              <Badge className="bg-gray-800 text-white hover:bg-gray-700">{filme.qualidade || 'HD'}</Badge>
              <Badge className="bg-gray-800 text-white hover:bg-gray-700">{filme.idioma || 'DUB'}</Badge>
              <div className="flex items-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${Number(filme.avaliacao) >= star * 2 ? 'fill-yellow-500 text-yellow-500' : 
                                             Number(filme.avaliacao) >= star * 2 - 1 ? 'fill-yellow-500/50 text-yellow-500' : 
                                             'text-gray-600'}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-yellow-500">{formattedRating}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {filme.generos?.map((genero, index) => (
                <Badge 
                  key={index} 
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  {genero}
                </Badge>
              ))}
            </div>
            
            <div className="mb-6">
              <h3 className="text-white font-semibold text-lg mb-2">Sinopse</h3>
              <p className="text-gray-400 leading-relaxed">
                {filme.descricao || 'Nenhuma sinopse disponível.'}
              </p>
            </div>
            
            <FilmeInfoTecnica filme={filme} />
            
            <div className="hidden md:flex flex-wrap gap-3">
              <Button 
                className="bg-movieRed hover:bg-movieRed/90 text-white rounded-md px-6"
                onClick={() => {
                  setActiveTab('assistir');
                  setIsTrailer(false);
                }}
              >
                <Play className="mr-2 h-5 w-5 fill-white" /> Assistir Agora
              </Button>
              
              <Button 
                variant="outline" 
                className="border-gray-700 text-white bg-black/50 hover:bg-gray-800"
                onClick={() => {
                  setActiveTab('assistir');
                  setIsTrailer(true);
                }}
              >
                <Play className="mr-2 h-5 w-5" /> Trailer
              </Button>
              
              <Button 
                variant="outline"
                className="border-gray-700 text-white bg-black/50 hover:bg-gray-800"
                onClick={handleFavoritoClick}
              >
                <Plus className="mr-2 h-5 w-5" /> {isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              </Button>
              
              <Button 
                variant="outline"
                className="border-gray-700 text-white bg-black/50 hover:bg-gray-800"
                onClick={baixarFilme}
              >
                <Download className="mr-2 h-5 w-5" /> Download
              </Button>
              
              <Button 
                variant="outline"
                className="border-gray-700 text-white bg-black/50 hover:bg-gray-800"
                onClick={compartilharFilme}
              >
                <Share2 className="mr-2 h-5 w-5" /> Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilmeInfoTecnica = ({ filme }: { filme: MovieResponse }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="flex items-start gap-2">
        <Film className="h-5 w-5 text-gray-500 mt-0.5" />
        <div>
          <h4 className="text-gray-400 font-medium">Diretor</h4>
          <p className="text-white">{filme.diretor || 'Não informado'}</p>
        </div>
      </div>
      
      <div className="flex items-start gap-2">
        <Users className="h-5 w-5 text-gray-500 mt-0.5" />
        <div>
          <h4 className="text-gray-400 font-medium">Elenco</h4>
          <p className="text-white">{filme.elenco || 'Não informado'}</p>
        </div>
      </div>
      
      <div className="flex items-start gap-2">
        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
        <div>
          <h4 className="text-gray-400 font-medium">Produtor</h4>
          <p className="text-white">{filme.produtor || 'Não informado'}</p>
        </div>
      </div>
      
      <div className="flex items-start gap-2">
        <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
        <div>
          <h4 className="text-gray-400 font-medium">Duração</h4>
          <p className="text-white">{filme.duracao}</p>
        </div>
      </div>
    </div>
  );
};

export default FilmeHeader;
