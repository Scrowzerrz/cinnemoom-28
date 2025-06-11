
import { Button } from '@/components/ui/button';

interface PaginacaoUsuariosProps {
  totalItems: number;
  itensPorPagina: number;
  paginaAtual: number;
  onMudarPagina: (pagina: number) => void;
}

export function PaginacaoUsuarios({ 
  totalItems, 
  itensPorPagina, 
  paginaAtual, 
  onMudarPagina 
}: PaginacaoUsuariosProps) {
  const totalPaginas = Math.ceil(totalItems / itensPorPagina);
  const indiceFinal = paginaAtual * itensPorPagina;
  const indiceInicial = indiceFinal - itensPorPagina;
  
  if (totalItems <= itensPorPagina) {
    return null;
  }
  
  return (
    <div className="flex items-center justify-between border-t border-gray-800 p-4">
      <div className="text-sm text-gray-400">
        Mostrando {indiceInicial + 1}-{Math.min(indiceFinal, totalItems)} de {totalItems}
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="border-gray-700"
          disabled={paginaAtual === 1}
          onClick={() => onMudarPagina(paginaAtual - 1)}
        >
          Anterior
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="border-gray-700"
          disabled={paginaAtual === totalPaginas}
          onClick={() => onMudarPagina(paginaAtual + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
