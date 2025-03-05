
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RefreshCw } from 'lucide-react';

interface SerieErrorProps {
  onRetry?: () => void;
}

const SerieError = ({ onRetry }: SerieErrorProps) => {
  return (
    <div className="bg-movieDarkBlue min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-2">Série não encontrada</h2>
          <p className="text-movieGray mb-6">Não foi possível encontrar a série solicitada</p>
          <div className="flex gap-4 justify-center">
            {onRetry && (
              <Button 
                onClick={onRetry}
                className="bg-movieRed hover:bg-movieRed/90 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
            )}
            <Link to="/series">
              <Button className="bg-movieDarkBlue border border-white/10 hover:bg-movieDarkBlue/90">
                Voltar para séries
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SerieError;
