
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Film, 
  Tv, 
  Users, 
  LogOut, 
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import GerenciarFilmes from './GerenciarFilmes';
import GerenciarSeries from './GerenciarSeries';
import GerenciarUsuarios from './GerenciarUsuarios';
import DashboardAdmin from './DashboardAdmin';

const PainelAdmin = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [aba, setAba] = useState("dashboard");

  useEffect(() => {
    document.title = "Painel Administrativo | Cineflix";
  }, []);

  const handleLogout = async () => {
    await signOut();
    toast.success("Sessão encerrada com sucesso");
    navigate('/');
  };

  const handleVoltarSite = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-movieDark text-white">
      {/* Cabeçalho */}
      <header className="bg-movieDarkBlue border-b border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">Cineflix</span>
            <div className="w-4 h-4 bg-movieRed rotate-45 relative">
              <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                <span className="text-white text-xs font-bold">+</span>
              </div>
            </div>
            <span className="ml-2 text-xl font-semibold">Admin</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-300 hover:text-white flex items-center gap-2"
              onClick={handleVoltarSite}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar ao site</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-300 hover:text-white flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto mt-6 px-4">
        <Card className="bg-movieDarkBlue border-gray-800">
          <Tabs defaultValue="dashboard" value={aba} onValueChange={setAba} className="w-full">
            <TabsList className="w-full bg-movieDark border-b border-gray-800 rounded-none p-0">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-movieRed rounded-none py-3 px-5 flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="filmes" 
                className="data-[state=active]:bg-movieRed rounded-none py-3 px-5 flex items-center gap-2"
              >
                <Film className="h-4 w-4" />
                <span>Filmes</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="series" 
                className="data-[state=active]:bg-movieRed rounded-none py-3 px-5 flex items-center gap-2"
              >
                <Tv className="h-4 w-4" />
                <span>Séries</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="usuarios" 
                className="data-[state=active]:bg-movieRed rounded-none py-3 px-5 flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span>Usuários</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="p-6">
              <DashboardAdmin />
            </TabsContent>
            
            <TabsContent value="filmes" className="p-6">
              <GerenciarFilmes />
            </TabsContent>
            
            <TabsContent value="series" className="p-6">
              <GerenciarSeries />
            </TabsContent>
            
            <TabsContent value="usuarios" className="p-6">
              <GerenciarUsuarios />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default PainelAdmin;
