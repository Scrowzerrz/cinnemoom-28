
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotificacoes, Notificacao } from '@/hooks/useNotificacoes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

const NotificacaoBadge = () => {
  const { notificacoes, naoLidas, marcarComoLida } = useNotificacoes();
  const navigate = useNavigate();

  const handleClick = async (notificacao: Notificacao) => {
    await marcarComoLida.mutateAsync(notificacao.id);
    
    // Navegar para o conteúdo apropriado
    if (notificacao.item_tipo === 'filme') {
      navigate(`/movie/${notificacao.item_id}`);
    } else if (notificacao.item_tipo === 'serie' || 
               notificacao.item_tipo === 'temporada' || 
               notificacao.item_tipo === 'episodio') {
      navigate(`/serie/${notificacao.item_id}`);
    } else if (notificacao.tipo === 'admin_promocao') {
      // Para notificações de promoção a admin, redirecionar para o painel admin
      navigate('/admin');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5 text-white" />
          {naoLidas > 0 && (
            <span className="absolute -top-1 -right-1 bg-movieRed text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {naoLidas}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="w-80 bg-movieDark border-movieGray/20"
      >
        <ScrollArea className="h-[300px]">
          {notificacoes.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              Nenhuma notificação
            </div>
          ) : (
            notificacoes.map((notificacao) => (
              <DropdownMenuItem
                key={notificacao.id}
                className={`p-4 cursor-pointer ${!notificacao.lida ? 'bg-movieDark/50' : ''}`}
                onClick={() => handleClick(notificacao)}
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-white">
                      {notificacao.titulo}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notificacao.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">
                    {notificacao.mensagem}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificacaoBadge;
