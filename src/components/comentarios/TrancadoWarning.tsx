
import { Lock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TrancadoWarningProps {
  dataTrancamento?: string;
  trancadoPorAdmin?: {
    id: string;
    nome: string;
  } | null;
}

const TrancadoWarning = ({ dataTrancamento, trancadoPorAdmin }: TrancadoWarningProps) => {
  const dataFormatada = dataTrancamento 
    ? format(new Date(dataTrancamento), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR }) 
    : null;

  return (
    <div className="bg-red-500/20 text-red-200 px-3 py-1.5 rounded-md mb-3 text-sm flex items-start gap-2">
      <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div>
        <span className="font-medium">
          Este comentário foi trancado
          {trancadoPorAdmin && <span> por <span className="text-white">{trancadoPorAdmin.nome}</span></span>}
          {dataFormatada && <span className="ml-1 opacity-75 text-xs">em {dataFormatada}</span>}
        </span>
        <span className="block mt-1 text-xs opacity-90">
          Respostas foram desativadas para este comentário
        </span>
      </div>
    </div>
  );
};

export default TrancadoWarning;
