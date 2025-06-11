
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Film, 
  Tv, 
  Users, 
  LogOut, 
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import GerenciarFilmes from './GerenciarFilmes';
import GerenciarSeries from './GerenciarSeries';
import GerenciarUsuarios from './GerenciarUsuarios';
import DashboardAdmin from './DashboardAdmin';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

const PainelAdmin = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const isMobile = useMobile();

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home, component: DashboardAdmin },
    { id: "filmes", label: "Filmes", icon: Film, component: GerenciarFilmes },
    { id: "series", label: "Séries", icon: Tv, component: GerenciarSeries },
    { id: "usuarios", label: "Usuários", icon: Users, component: GerenciarUsuarios },
  ];

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

  const handleMenuClick = (itemId: string) => {
    setAbaAtiva(itemId);
    if (isMobile) {
      setSidebarAberta(false);
    }
  };

  const ComponenteAtivo = menuItems.find(item => item.id === abaAtiva)?.component || DashboardAdmin;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-movieDarkBlue border-r border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-white">Cineflix</span>
          <div className="w-3 h-3 bg-movieRed rotate-45 relative">
            <div className="absolute inset-0 flex items-center justify-center -rotate-45">
              <span className="text-white text-[10px] font-bold">+</span>
            </div>
          </div>
          <span className="text-sm font-semibold text-gray-300">Admin</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  abaAtiva === item.id
                    ? "bg-movieRed text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full justify-start text-gray-300 hover:text-white"
          onClick={handleVoltarSite}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar ao site
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full justify-start text-gray-300 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-movieDark text-white flex">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-64 hidden lg:block">
          <SidebarContent />
        </div>
      )}

      {/* Mobile Header and Sheet */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-movieDarkBlue border-b border-gray-800 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sheet open={sidebarAberta} onOpenChange={setSidebarAberta}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              
              <span className="text-lg font-bold text-white">Cineflix Admin</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleVoltarSite}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col",
        isMobile ? "pt-16" : ""
      )}>
        {/* Desktop Header */}
        {!isMobile && (
          <header className="bg-movieDarkBlue border-b border-gray-800 p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">
                {menuItems.find(item => item.id === abaAtiva)?.label || "Dashboard"}
              </h1>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-300 hover:text-white"
                  onClick={handleVoltarSite}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Voltar ao site
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-300 hover:text-white"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </header>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <ComponenteAtivo />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PainelAdmin;
