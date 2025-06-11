
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
  ChevronRight,
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
  const [sidebarMinimizada, setSidebarMinimizada] = useState(false);
  const isMobile = useMobile();
  
  // Detectar zoom e viewport pequeno
  const [isSmallViewport, setIsSmallViewport] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsSmallViewport(window.innerWidth < 1280); // XL breakpoint
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

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
    // Fechar sidebar em viewport pequeno após seleção
    if (isSmallViewport) {
      setSidebarAberta(false);
    }
  };

  const toggleSidebarMinimizada = () => {
    setSidebarMinimizada(!sidebarMinimizada);
  };

  const ComponenteAtivo = menuItems.find(item => item.id === abaAtiva)?.component || DashboardAdmin;

  const SidebarContent = ({ minimized = false }: { minimized?: boolean }) => (
    <div className={cn(
      "flex flex-col h-full bg-movieDarkBlue border-r border-gray-800 min-h-screen transition-all duration-300",
      minimized ? "w-16" : "w-full"
    )}>
      {/* Header com logo responsivo */}
      <div className="p-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center", minimized ? "justify-center w-full" : "space-x-2")}>
            {!minimized && <span className="text-lg font-bold text-white">Cineflix</span>}
            <div className="w-3 h-3 bg-movieRed rotate-45 relative flex-shrink-0">
              <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                <span className="text-white text-[10px] font-bold">+</span>
              </div>
            </div>
            {!minimized && <span className="text-sm font-semibold text-gray-300">Admin</span>}
          </div>
          {!isSmallViewport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebarMinimizada}
              className="text-gray-400 hover:text-white p-1"
            >
              {minimized ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
      
      {/* Navigation com scroll interno */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                title={minimized ? item.label : undefined}
                className={cn(
                  "w-full flex items-center rounded-lg transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-movieRed focus:ring-offset-2 focus:ring-offset-movieDarkBlue",
                  minimized ? "justify-center p-3" : "gap-3 px-3 py-3",
                  abaAtiva === item.id
                    ? "bg-movieRed text-white shadow-md"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!minimized && <span className="truncate text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>
      
      {/* Footer actions */}
      <div className="p-2 border-t border-gray-800 space-y-1 flex-shrink-0">
        <Button 
          variant="ghost" 
          size="sm"
          title={minimized ? "Voltar ao site" : undefined}
          className={cn(
            "w-full text-gray-300 hover:text-white text-sm",
            minimized ? "justify-center p-3" : "justify-start"
          )}
          onClick={handleVoltarSite}
        >
          <ChevronLeft className="h-4 w-4 flex-shrink-0" />
          {!minimized && <span className="ml-2 truncate">Voltar ao site</span>}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          title={minimized ? "Sair" : undefined}
          className={cn(
            "w-full text-gray-300 hover:text-white text-sm",
            minimized ? "justify-center p-3" : "justify-start"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!minimized && <span className="ml-2 truncate">Sair</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-movieDark text-white overflow-hidden">
      {/* Universal Hamburger Menu - Always visible and accessible */}
      <div className={cn(
        "fixed top-4 z-50 transition-all duration-300",
        isSmallViewport ? "left-4" : sidebarMinimizada ? "left-20" : "left-4"
      )}>
        <Sheet open={sidebarAberta} onOpenChange={setSidebarAberta}>
          <SheetTrigger asChild>
            <Button 
              variant="default" 
              size="sm"
              className="bg-movieRed hover:bg-movieRed/80 text-white shadow-xl border border-movieRed/50 backdrop-blur-sm"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 max-w-[90vw] border-movieRed/20">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex min-h-screen relative">
        {/* Desktop Sidebar - Conditional visibility and width */}
        <div className={cn(
          "hidden xl:flex transition-all duration-300 flex-shrink-0 relative z-10",
          sidebarMinimizada ? "xl:w-16" : "xl:w-72"
        )}>
          <SidebarContent minimized={sidebarMinimizada} />
        </div>

        {/* Main Content Area with dynamic padding */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          !isSmallViewport && !sidebarMinimizada ? "xl:ml-0" : ""
        )}>
          {/* Compact Top Header Bar */}
          <header className="bg-movieDarkBlue/95 backdrop-blur-sm border-b border-gray-800/50 px-4 py-2 sm:px-6 sm:py-3 relative z-20">
            <div className="flex items-center justify-between min-h-[3rem]">
              <div className="flex items-center gap-4 min-w-0 pl-12 xl:pl-4">
                {/* Page Title with breadcrumb */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <span>Admin</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-movieRed">{menuItems.find(item => item.id === abaAtiva)?.label}</span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                    {menuItems.find(item => item.id === abaAtiva)?.label || "Dashboard"}
                  </h1>
                </div>
              </div>
              
              {/* Compact Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-300 hover:text-white p-2"
                  onClick={handleVoltarSite}
                  title="Voltar ao site"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden lg:inline ml-1 text-xs">Voltar</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-300 hover:text-white p-2"
                  onClick={handleLogout}
                  title="Sair do painel"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline ml-1 text-xs">Sair</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Scrollable Content Area */}
          <main className="flex-1 overflow-auto relative">
            <div className="p-4 sm:p-6 lg:p-8 pb-8 min-h-full">
              <div className="max-w-none mx-auto">
                <ComponenteAtivo />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile-only bottom navigation for quick access */}
      {isSmallViewport && (
        <div className="fixed bottom-4 right-4 z-40 flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="bg-movieDarkBlue/90 hover:bg-movieDarkBlue text-white shadow-lg backdrop-blur-sm border border-gray-600"
            onClick={handleVoltarSite}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-movieDarkBlue/90 hover:bg-movieDarkBlue text-white shadow-lg backdrop-blur-sm border border-gray-600"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PainelAdmin;
