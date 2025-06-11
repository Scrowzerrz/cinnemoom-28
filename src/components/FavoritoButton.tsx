
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface FavoritoButtonProps {
  itemId: string;
  tipo: 'filme' | 'serie';
  className?: string;
}

const FavoritoButton = ({ itemId, tipo, className = '' }: FavoritoButtonProps) => {
  const { perfil } = useAuth();
  const { favoritos, adicionarFavorito, removerFavorito } = useFavoritos();
  const navigate = useNavigate();

  const isFavorito = favoritos.some(f => f.item_id === itemId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!perfil) {
      navigate('/auth');
      return;
    }

    if (isFavorito) {
      await removerFavorito.mutateAsync(itemId);
    } else {
      await adicionarFavorito.mutateAsync({ itemId, tipo });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`${className} h-8 w-8 bg-black/40 p-0 hover:bg-black/60`}
      onClick={handleClick}
    >
      <Heart 
        className={`h-4 w-4 ${isFavorito ? 'fill-movieRed stroke-movieRed' : 'text-white'}`} 
      />
    </Button>
  );
};

export default FavoritoButton;
