
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SerieError = () => {
  return (
    <div className="bg-movieDarkBlue min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-2">Série não encontrada</h2>
          <p className="text-movieGray mb-6">Não foi possível encontrar a série solicitada</p>
          <Link to="/series">
            <Button className="bg-movieRed hover:bg-movieRed/90">
              Voltar para séries
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SerieError;
