
import { EyeOff } from 'lucide-react';

const VisibilityWarning = () => {
  return (
    <div className="bg-amber-500/20 text-amber-200 px-3 py-1.5 rounded-md mb-3 text-sm flex items-center gap-2">
      <EyeOff className="h-4 w-4" />
      <span>Este comentário está oculto e só é visível para administradores</span>
    </div>
  );
};

export default VisibilityWarning;
