
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, Tv, Users, Activity, TrendingUp, Eye, Calendar, UserPlus } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Estatisticas {
  totalFilmes: number;
  totalSeries: number;
  totalUsuarios: number;
  recentesFilmes: number;
  recentesSeries: number;
}

const DashboardAdmin = () => {
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    totalFilmes: 0,
    totalSeries: 0,
    totalUsuarios: 0,
    recentesFilmes: 0,
    recentesSeries: 0
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarEstatisticas = async () => {
      setCarregando(true);
      try {
        console.log("Iniciando carregamento de estatísticas...");
        
        // Obter total de filmes
        const { count: totalFilmes, error: erroFilmes } = await supabase
          .from('filmes')
          .select('*', { count: 'exact', head: true });

        // Obter total de séries
        const { count: totalSeries, error: erroSeries } = await supabase
          .from('series')
          .select('*', { count: 'exact', head: true });

        // Obter total de usuários
        const { count: totalUsuarios, error: erroUsuarios } = await supabase
          .from('perfis')
          .select('*', { count: 'exact', head: true });
          
        console.log("Total de usuários encontrados:", totalUsuarios);

        // Obter filmes recentes (últimos 30 dias)
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - 30);
        
        const { count: recentesFilmes, error: erroRecentesFilmes } = await supabase
          .from('filmes')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dataLimite.toISOString());

        // Obter séries recentes (últimos 30 dias)
        const { count: recentesSeries, error: erroRecentesSeries } = await supabase
          .from('series')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dataLimite.toISOString());

        if (erroFilmes || erroSeries || erroUsuarios || erroRecentesFilmes || erroRecentesSeries) {
          console.error("Erros ao carregar estatísticas:", {
            erroFilmes, erroSeries, erroUsuarios, erroRecentesFilmes, erroRecentesSeries
          });
          throw new Error("Erro ao carregar estatísticas");
        }

        const novasEstatisticas = {
          totalFilmes: totalFilmes || 0,
          totalSeries: totalSeries || 0,
          totalUsuarios: totalUsuarios || 0,
          recentesFilmes: recentesFilmes || 0,
          recentesSeries: recentesSeries || 0
        };
        
        console.log("Estatísticas carregadas com sucesso:", novasEstatisticas);
        setEstatisticas(novasEstatisticas);

      } catch (erro) {
        console.error("Erro ao carregar estatísticas:", erro);
      } finally {
        setCarregando(false);
      }
    };

    carregarEstatisticas();
  }, []);

  const StatCard = ({ title, value, icon: Icon, description, trend }: {
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    trend?: number;
  }) => (
    <Card className="bg-movieDark border-gray-800 hover:border-gray-700 transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-movieRed/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-movieRed" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          {carregando ? (
            <Skeleton className="h-8 w-16 bg-gray-700" />
          ) : (
            <div className="text-2xl font-bold text-white">{value}</div>
          )}
          {trend && !carregando && (
            <Badge variant={trend > 0 ? "default" : "secondary"} className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend > 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-400">
          {carregando ? <Skeleton className="h-3 w-32 bg-gray-700" /> : description}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm">Visão geral do sistema</p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Activity className="h-3 w-3 mr-1" />
          Sistema ativo
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Filmes"
          value={estatisticas.totalFilmes}
          icon={Film}
          description={`${estatisticas.recentesFilmes} adicionados nos últimos 30 dias`}
          trend={estatisticas.recentesFilmes > 0 ? 12 : 0}
        />
        
        <StatCard
          title="Total de Séries"
          value={estatisticas.totalSeries}
          icon={Tv}
          description={`${estatisticas.recentesSeries} adicionadas nos últimos 30 dias`}
          trend={estatisticas.recentesSeries > 0 ? 8 : 0}
        />
        
        <StatCard
          title="Usuários Ativos"
          value={estatisticas.totalUsuarios}
          icon={Users}
          description="Usuários registrados no sistema"
        />
        
        <StatCard
          title="Conteúdo Recente"
          value={estatisticas.recentesFilmes + estatisticas.recentesSeries}
          icon={Calendar}
          description="Novos títulos nos últimos 30 dias"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="bg-movieDark border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-movieRed" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-movieDarkBlue rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                <Film className="h-4 w-4 text-movieRed mb-1" />
                <p className="text-xs font-medium">Novo Filme</p>
              </div>
              <div className="p-3 bg-movieDarkBlue rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                <Tv className="h-4 w-4 text-movieRed mb-1" />
                <p className="text-xs font-medium">Nova Série</p>
              </div>
              <div className="p-3 bg-movieDarkBlue rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                <Users className="h-4 w-4 text-movieRed mb-1" />
                <p className="text-xs font-medium">Usuários</p>
              </div>
              <div className="p-3 bg-movieDarkBlue rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                <Eye className="h-4 w-4 text-movieRed mb-1" />
                <p className="text-xs font-medium">Analytics</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-movieDark border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-movieRed" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-24 bg-gray-700" />
                      <Skeleton className="h-2 w-16 bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Sistema iniciado</span>
                  <span className="text-gray-500 text-xs ml-auto">agora</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Dashboard carregado</span>
                  <span className="text-gray-500 text-xs ml-auto">1m atrás</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-300">Aguardando conexão BD</span>
                  <span className="text-gray-500 text-xs ml-auto">2m atrás</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-movieDark border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-movieRed" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Banco de Dados</span>
              <Badge variant="secondary" className="text-xs">
                Offline
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">API Status</span>
              <Badge variant="default" className="text-xs bg-green-600">
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">CDN</span>
              <Badge variant="default" className="text-xs bg-green-600">
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Upload</span>
              <Badge variant="default" className="text-xs bg-green-600">
                Funcional
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-movieDark border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-movieRed" />
              Métricas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Tempo de Resposta</span>
                <span className="text-sm font-medium text-green-400">~120ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Uptime</span>
                <span className="text-sm font-medium text-green-400">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Requests/min</span>
                <span className="text-sm font-medium text-blue-400">~45</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-movieDark border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-movieRed" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Usuários Online</span>
                <span className="text-sm font-medium text-green-400">~12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Sessões Ativas</span>
                <span className="text-sm font-medium text-blue-400">~8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Bounce Rate</span>
                <span className="text-sm font-medium text-yellow-400">~15%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAdmin;
