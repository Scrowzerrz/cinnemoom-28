
import { EyeOff, AlertTriangle, Bot } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VisibilityWarningProps {
  moderationReason?: string;
  ocultadoAutomaticamente?: boolean;
  ocultadoPorAdmin?: {
    id: string;
    nome: string;
  } | null;
  dataOcultacao?: string;
}

const VisibilityWarning = ({ 
  moderationReason, 
  ocultadoAutomaticamente = false,
  ocultadoPorAdmin,
  dataOcultacao
}: VisibilityWarningProps) => {
  const dataFormatada = dataOcultacao 
    ? format(new Date(dataOcultacao), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR }) 
    : null;

  return (
    <div className="bg-amber-500/20 text-amber-200 px-3 py-1.5 rounded-md mb-3 text-sm flex items-start gap-2">
      {ocultadoAutomaticamente ? (
        <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
      ) : (
        <EyeOff className="h-4 w-4 mt-0.5 flex-shrink-0" />
      )}
      
      <div>
        {ocultadoAutomaticamente ? (
          <span className="font-medium">Este comentário foi ocultado pela moderação automática</span>
        ) : ocultadoPorAdmin ? (
          <span className="font-medium">
            Este comentário foi ocultado por <span className="text-white">{ocultadoPorAdmin.nome}</span>
            {dataFormatada && <span className="ml-1 opacity-75 text-xs">em {dataFormatada}</span>}
          </span>
        ) : (
          <span className="font-medium">Este comentário está oculto</span>
        )}
        
        {moderationReason && (
          <span className="block mt-1 text-xs opacity-90 italic">
            Motivo: {moderationReason}
          </span>
        )}
      </div>
    </div>
  );
};

export default VisibilityWarning;
