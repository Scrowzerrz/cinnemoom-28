
import { Lock } from 'lucide-react';
import { formatarData } from './utils/commentUtils';

interface TrancadoWarningProps {
  dataTrancamento?: string;
}

const TrancadoWarning = ({ dataTrancamento }: TrancadoWarningProps) => {
  return (
    <div className="bg-red-500/20 text-red-300 px-3 py-1.5 rounded-md mb-3 text-sm flex items-center gap-2">
      <Lock className="h-4 w-4" />
      <span>
        Este comentário está trancado. Novas respostas não são permitidas.
        {dataTrancamento && (
          <span className="text-xs block opacity-80">
            Trancado {formatarData(dataTrancamento)}
          </span>
        )}
      </span>
    </div>
  );
};

export default TrancadoWarning;
