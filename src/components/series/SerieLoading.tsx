
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';

const SerieLoading = () => {
  return (
    <div className="bg-movieDarkBlue min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-12 w-12 text-movieRed animate-spin" />
      </div>
      <Footer />
    </div>
  );
};

export default SerieLoading;
