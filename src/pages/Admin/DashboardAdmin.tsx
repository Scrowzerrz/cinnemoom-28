
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
  totalVisualizacoes: number;
  totalComentarios: number;
  usuariosAtivos: number;
  conteudoMaisVisto: {
    tipo: 'filme' | 'serie';
    titulo: string;
    visualizacoes: number;
  } | null;
  ultimasAdicoes: Array<{
    id: string;
    titulo: string;
    tipo: 'filme' | 'serie';
    created_at: string;
  }>;
}

const DashboardAdmin = () => {
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    totalFilmes: 0,
    totalSeries: 0,
    totalUsuarios: 0,
    recentesFilmes: 0,
    recentesSeries: 0,
    totalVisualizacoes: 0,
    totalComentarios: 0,
    usuariosAtivos: 0,
    conteudoMaisVisto: null,
    ultimasAdicoes: []
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarEstatisticas = async () => {
      setCarregando(true);
      try {
        console.log("Iniciando carregamento de estatísticas...");
        
        // Data limite para estatísticas recentes (últimos 30 dias)
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - 30);
        const dataLimiteISO = dataLimite.toISOString();

        // Executar todas as consultas em paralelo
        const [
          filmesResult,
          seriesResult,
          usuariosResult,
          recentesFilmesResult,
          recentesSeriesResult,
          comentariosResult,
          visualizacoesFilmesResult,
          visualizacoesSeriesResult,
          ultimasAdicoesFilmesResult,
          ultimasAdicoesSeriesResult,
          filmeMaisVistoResult,
          serieMaisVistaResult
        ] = await Promise.all([
          // Total de filmes
          supabase.from('filmes').select('*', { count: 'exact', head: true }),
          
          // Total de séries
          supabase.from('series').select('*', { count: 'exact', head: true }),
          
          // Total de usuários
          supabase.from('perfis').select('*', { count: 'exact', head: true }),
          
          // Filmes recentes (últimos 30 dias)
          supabase.from('filmes').select('*', { count: 'exact', head: true }).gte('created_at', dataLimiteISO),
          
          // Séries recentes (últimos 30 dias)
          supabase.from('series').select('*', { count: 'exact', head: true }).gte('created_at', dataLimiteISO),
          
          // Total de comentários
          supabase.from('comentarios').select('*', { count: 'exact', head: true }),
          
          // Soma de visualizações de filmes
          supabase.from('filmes').select('visualizacoes'),
          
          // Soma de visualizações de séries
          supabase.from('series').select('visualizacoes'),
          
          // Últimas adições de filmes (últimos 5)
          supabase.from('filmes').select('id, titulo, created_at').order('created_at', { ascending: false }).limit(5),
          
          // Últimas adições de séries (últimos 5)
          supabase.from('series').select('id, titulo, created_at').order('created_at', { ascending: false }).limit(5),
          
          // Filme mais visto
          supabase.from('filmes').select('titulo, visualizacoes').order('visualizacoes', { ascending: false }).limit(1),
          
          // Série mais vista
          supabase.from('series').select('titulo, visualizacoes').order('visualizacoes', { ascending: false }).limit(1)
        ]);

        // Verificar erros
        const resultados = [
          filmesResult, seriesResult, usuariosResult, recentesFilmesResult, 
          recentesSeriesResult, comentariosResult, visualizacoesFilmesResult,
          visualizacoesSeriesResult, ultimasAdicoesFilmesResult, ultimasAdicoesSeriesResult,
          filmeMaisVistoResult, serieMaisVistaResult
        ];

        const erros = resultados.filter(result => result.error);
        if (erros.length > 0) {
          console.error("Erros ao carregar estatísticas:", erros);
          // Continuar com dados disponíveis mesmo se houver alguns erros
        }

        // Calcular totais de visualizações
        const totalVisualizacoesFilmes = visualizacoesFilmesResult.data?.reduce(
          (sum, filme) => sum + (filme.visualizacoes || 0), 0
        ) || 0;
        
        const totalVisualizacoesSeries = visualizacoesSeriesResult.data?.reduce(
          (sum, serie) => sum + (serie.visualizacoes || 0), 0
        ) || 0;

        // Determinar conteúdo mais visto
        const filmeMaisVisto = filmeMaisVistoResult.data?.[0];
        const serieMaisVista = serieMaisVistaResult.data?.[0];
        
        let conteudoMaisVisto = null;
        if (filmeMaisVisto && serieMaisVista) {
          conteudoMaisVisto = (filmeMaisVisto.visualizacoes || 0) > (serieMaisVista.visualizacoes || 0)
            ? { tipo: 'filme' as const, titulo: filmeMaisVisto.titulo, visualizacoes: filmeMaisVisto.visualizacoes || 0 }
            : { tipo: 'serie' as const, titulo: serieMaisVista.titulo, visualizacoes: serieMaisVista.visualizacoes || 0 };
        } else if (filmeMaisVisto) {
          conteudoMaisVisto = { tipo: 'filme' as const, titulo: filmeMaisVisto.titulo, visualizacoes: filmeMaisVisto.visualizacoes || 0 };
        } else if (serieMaisVista) {
          conteudoMaisVisto = { tipo: 'serie' as const, titulo: serieMaisVista.titulo, visualizacoes: serieMaisVista.visualizacoes || 0 };
        }

        // Combinar últimas adições
        const ultimasAdicoesFilmes = ultimasAdicoesFilmesResult.data?.map(filme => ({
          ...filme,
          tipo: 'filme' as const
        })) || [];
        
        const ultimasAdicoesSeries = ultimasAdicoesSeriesResult.data?.map(serie => ({
          ...serie,
          tipo: 'serie' as const
        })) || [];

        const ultimasAdicoes = [...ultimasAdicoesFilmes, ...ultimasAdicoesSeries]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        const novasEstatisticas: Estatisticas = {
          totalFilmes: filmesResult.count || 0,
          totalSeries: seriesResult.count || 0,
          totalUsuarios: usuariosResult.count || 0,
          recentesFilmes: recentesFilmesResult.count || 0,
          recentesSeries: recentesSeriesResult.count || 0,
          totalVisualizacoes: totalVisualizacoesFilmes + totalVisualizacoesSeries,
          totalComentarios: comentariosResult.count || 0,
          usuariosAtivos: usuariosResult.count || 0, // Simplificado - todos os usuários cadastrados
          conteudoMaisVisto,
          ultimasAdicoes
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
          title="Total de Visualizações"
          value={estatisticas.totalVisualizacoes.toLocaleString()}
          icon={Eye}
          description="Visualizações em todo o catálogo"
        />
        
        <StatCard
          title="Comentários"
          value={estatisticas.totalComentarios}
          icon={Users}
          description="Total de comentários na plataforma"
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

        {/* Últimas Adições */}
        <Card className="bg-movieDark border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-movieRed" />
              Últimas Adições
            </CardTitle>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-32 bg-gray-700" />
                      <Skeleton className="h-2 w-20 bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : estatisticas.ultimasAdicoes.length > 0 ? (
              <div className="space-y-3">
                {estatisticas.ultimasAdicoes.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className={`h-2 w-2 rounded-full ${item.tipo === 'filme' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                    <div className="flex-1">
                      <span className="text-gray-300">{item.titulo}</span>
                      <p className="text-xs text-gray-500">
                        {item.tipo === 'filme' ? 'Filme' : 'Série'} • {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm">
                Nenhuma adição recente
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conteúdo Mais Popular */}
        <Card className="bg-movieDark border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-movieRed" />
              Mais Popular
            </CardTitle>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-32 bg-gray-700" />
                <Skeleton className="h-6 w-48 bg-gray-700" />
                <Skeleton className="h-3 w-24 bg-gray-700" />
              </div>
            ) : estatisticas.conteudoMaisVisto ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {estatisticas.conteudoMaisVisto.tipo === 'filme' ? (
                    <Film className="h-4 w-4 text-blue-400" />
                  ) : (
                    <Tv className="h-4 w-4 text-green-400" />
                  )}
                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                    {estatisticas.conteudoMaisVisto.tipo}
                  </span>
                </div>
                <h3 className="font-medium text-white">
                  {estatisticas.conteudoMaisVisto.titulo}
                </h3>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {estatisticas.conteudoMaisVisto.visualizacoes.toLocaleString()} visualizações
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm">
                Dados não disponíveis
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Atividade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-movieDark border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-movieRed" />
              Resumo do Catálogo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Total de Títulos</span>
                <span className="text-sm font-medium text-blue-400">
                  {carregando ? (
                    <Skeleton className="h-4 w-8 bg-gray-700" />
                  ) : (
                    (estatisticas.totalFilmes + estatisticas.totalSeries).toLocaleString()
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Conteúdo Recente</span>
                <span className="text-sm font-medium text-green-400">
                  {carregando ? (
                    <Skeleton className="h-4 w-8 bg-gray-700" />
                  ) : (
                    `${estatisticas.recentesFilmes + estatisticas.recentesSeries} nos últimos 30 dias`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Usuários Registrados</span>
                <span className="text-sm font-medium text-yellow-400">
                  {carregando ? (
                    <Skeleton className="h-4 w-8 bg-gray-700" />
                  ) : (
                    estatisticas.totalUsuarios.toLocaleString()
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-movieDark border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-movieRed" />
              Estatísticas de Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Total de Visualizações</span>
                <span className="text-sm font-medium text-green-400">
                  {carregando ? (
                    <Skeleton className="h-4 w-12 bg-gray-700" />
                  ) : (
                    estatisticas.totalVisualizacoes.toLocaleString()
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Comentários Ativos</span>
                <span className="text-sm font-medium text-blue-400">
                  {carregando ? (
                    <Skeleton className="h-4 w-8 bg-gray-700" />
                  ) : (
                    estatisticas.totalComentarios.toLocaleString()
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Média de Visualizações</span>
                <span className="text-sm font-medium text-yellow-400">
                  {carregando ? (
                    <Skeleton className="h-4 w-8 bg-gray-700" />
                  ) : estatisticas.totalFilmes + estatisticas.totalSeries > 0 ? (
                    Math.round(estatisticas.totalVisualizacoes / (estatisticas.totalFilmes + estatisticas.totalSeries)).toLocaleString()
                  ) : (
                    '0'
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAdmin;
