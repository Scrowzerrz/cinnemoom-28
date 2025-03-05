
import { EyeOff } from 'lucide-react';

interface VisibilityWarningProps {
  moderationReason?: string;
}

const VisibilityWarning = ({ moderationReason }: VisibilityWarningProps) => {
  return (
    <div className="bg-amber-500/20 text-amber-200 px-3 py-1.5 rounded-md mb-3 text-sm flex items-start gap-2">
      <EyeOff className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div>
        <span className="font-medium">Este comentário foi ocultado pela moderação automática</span>
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
