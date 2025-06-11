
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface ComentariosOcultosToggleProps {
  count: number;
  aberto: boolean;
  onAlternar: () => void;
}

const ComentariosOcultosToggle = ({ 
  count, 
  aberto, 
  onAlternar 
}: ComentariosOcultosToggleProps) => {
  if (count === 0) return null;
  
  return (
    <div className="my-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onAlternar}
        className="text-amber-400 border-amber-400/30 hover:bg-amber-500/10 w-full justify-center"
      >
        {aberto ? (
          <>
            <EyeOff className="h-4 w-4 mr-2" />
            Ocultar {count} comentário{count !== 1 ? 's' : ''} com restrição
          </>
        ) : (
          <>
            <Eye className="h-4 w-4 mr-2" />
            Mostrar {count} comentário{count !== 1 ? 's' : ''} com restrição
          </>
        )}
      </Button>
    </div>
  );
};

export default ComentariosOcultosToggle;
