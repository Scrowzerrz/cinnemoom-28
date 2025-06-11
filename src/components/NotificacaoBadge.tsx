
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useNotificacoes, Notificacao } from '@/hooks/useNotificacoes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

const NotificacaoBadge = () => {
  const { notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas, isLoading } = useNotificacoes();
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
    } else if (notificacao.tipo === 'novo_like') {
      // Para notificações de curtidas, navegar para o item onde o comentário foi curtido
      if (notificacao.item_tipo === 'filme') {
        navigate(`/movie/${notificacao.item_id}`);
      } else if (notificacao.item_tipo === 'serie') {
        navigate(`/serie/${notificacao.item_id}`);
      }
    }
  };

  // Renderizar ícone com base no tipo de notificação
  const renderNotificationIcon = (tipo: string) => {
    // Você pode adicionar mais ícones personalizados aqui para diferentes tipos de notificações
    return null; // Por padrão, não exibe ícone adicional
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
        <div className="flex justify-between items-center px-4 py-2 border-b border-movieGray/20">
          <h3 className="font-medium text-white">Notificações</h3>
          {naoLidas > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm text-gray-400 hover:text-white"
              onClick={() => marcarTodasComoLidas.mutate()}
              disabled={marcarTodasComoLidas.isPending}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              Carregando notificações...
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              Nenhuma notificação
            </div>
          ) : (
            notificacoes.map((notificacao) => (
              <DropdownMenuItem
                key={notificacao.id}
                className={`p-4 cursor-pointer border-b border-movieGray/10 ${!notificacao.lida ? 'bg-movieDark/50' : ''}`}
                onClick={() => handleClick(notificacao)}
              >
                <div className="w-full">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-white">
                      {notificacao.titulo}
                      {!notificacao.lida && (
                        <span className="ml-2 inline-block w-2 h-2 bg-movieRed rounded-full"></span>
                      )}
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
        
        <DropdownMenuSeparator />
        <div className="p-2 text-center text-xs text-gray-500">
          Clique em uma notificação para visualizar o conteúdo
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificacaoBadge;
