
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

interface SerieErrorProps {
  onRetry?: () => void;
}

const SerieError = ({ onRetry }: SerieErrorProps) => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="bg-movieDark rounded-xl p-8 border border-gray-800 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
          <AlertCircle className="h-16 w-16 text-movieRed mb-4" />
          <h1 className="text-white text-2xl font-bold mb-2">Série não encontrada</h1>
          <p className="text-gray-400 mb-6">
            Não foi possível carregar os dados desta série. O conteúdo pode estar indisponível ou ocorreu um erro durante o carregamento.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {onRetry && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={onRetry}
                className="border-movieRed text-movieRed hover:bg-movieRed hover:text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            )}
            
            <Button asChild size="lg" className="bg-movieRed hover:bg-movieRed/90">
              <Link to="/series">
                Explorar outras séries
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SerieError;
