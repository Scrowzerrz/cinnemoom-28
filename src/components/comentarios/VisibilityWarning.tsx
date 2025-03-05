
import { EyeOff } from 'lucide-react';

interface VisibilityWarningProps {
  moderationReason?: string;
}

const VisibilityWarning = ({ moderationReason }: VisibilityWarningProps) => {
  return (
    <div className="bg-amber-500/20 text-amber-200 px-3 py-1.5 rounded-md mb-3 text-sm flex items-center gap-2">
      <EyeOff className="h-4 w-4" />
      <div>
        <span>Este comentário está oculto e só é visível para administradores</span>
        {moderationReason && (
          <span className="block mt-1 text-xs opacity-90">
            Motivo: {moderationReason}
          </span>
        )}
      </div>
    </div>
  );
};

export default VisibilityWarning;
