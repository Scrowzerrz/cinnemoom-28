
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { List, Play, Info, MessageCircle } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

interface AbaSerieProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AbaSerie = ({ activeTab, setActiveTab }: AbaSerieProps) => {
  const isMobile = useMobile();
  
  return (
    <TabsList className="w-full flex justify-between bg-movieDark/70 backdrop-blur-sm border border-white/10 rounded-lg mb-4 p-1 overflow-x-auto">
      <TabsTrigger 
        value="assistir" 
        onClick={() => setActiveTab('assistir')}
        className={`flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 px-2 md:px-4 text-xs md:text-sm ${
          activeTab === 'assistir' ? 'bg-movieRed text-white' : 'text-white/70 hover:text-white'
        }`}
      >
        <Play className="h-3 w-3 md:h-4 md:w-4" />
        {!isMobile && "Assistir"}
      </TabsTrigger>
      
      <TabsTrigger 
        value="temporadas" 
        onClick={() => setActiveTab('temporadas')}
        className={`flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 px-2 md:px-4 text-xs md:text-sm ${
          activeTab === 'temporadas' ? 'bg-movieRed text-white' : 'text-white/70 hover:text-white'
        }`}
      >
        <List className="h-3 w-3 md:h-4 md:w-4" />
        {!isMobile && "Temporadas"}
      </TabsTrigger>
      
      <TabsTrigger 
        value="sobre" 
        onClick={() => setActiveTab('sobre')}
        className={`flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 px-2 md:px-4 text-xs md:text-sm ${
          activeTab === 'sobre' ? 'bg-movieRed text-white' : 'text-white/70 hover:text-white'
        }`}
      >
        <Info className="h-3 w-3 md:h-4 md:w-4" />
        {!isMobile && "Sobre"}
      </TabsTrigger>
      
      <TabsTrigger 
        value="comentarios" 
        onClick={() => setActiveTab('comentarios')}
        className={`flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 px-2 md:px-4 text-xs md:text-sm ${
          activeTab === 'comentarios' ? 'bg-movieRed text-white' : 'text-white/70 hover:text-white'
        }`}
      >
        <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
        {!isMobile && "Comentários"}
      </TabsTrigger>
    </TabsList>
  );
};

export default AbaSerie;
