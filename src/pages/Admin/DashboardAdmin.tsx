
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, Tv, Users, Activity } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Visão Geral</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-movieDark border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Filmes</CardTitle>
            <Film className="h-4 w-4 text-movieRed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {carregando ? <div className="h-8 w-16 bg-gray-700 animate-pulse rounded"></div> : estatisticas.totalFilmes}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {carregando 
                ? <div className="h-3 w-28 bg-gray-700 animate-pulse rounded"></div> 
                : `${estatisticas.recentesFilmes} adicionados nos últimos 30 dias`
              }
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-movieDark border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Séries</CardTitle>
            <Tv className="h-4 w-4 text-movieRed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {carregando ? <div className="h-8 w-16 bg-gray-700 animate-pulse rounded"></div> : estatisticas.totalSeries}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {carregando 
                ? <div className="h-3 w-28 bg-gray-700 animate-pulse rounded"></div> 
                : `${estatisticas.recentesSeries} adicionadas nos últimos 30 dias`
              }
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-movieDark border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-movieRed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {carregando ? <div className="h-8 w-16 bg-gray-700 animate-pulse rounded"></div> : estatisticas.totalUsuarios}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {carregando 
                ? <div className="h-3 w-28 bg-gray-700 animate-pulse rounded"></div> 
                : "Usuários registrados"
              }
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-movieDark border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Atividade</CardTitle>
            <Activity className="h-4 w-4 text-movieRed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {carregando 
                ? <div className="h-8 w-16 bg-gray-700 animate-pulse rounded"></div> 
                : estatisticas.recentesFilmes + estatisticas.recentesSeries
              }
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {carregando 
                ? <div className="h-3 w-28 bg-gray-700 animate-pulse rounded"></div> 
                : "Novos títulos nos últimos 30 dias"
              }
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-movieDark border-gray-800">
          <CardHeader>
            <CardTitle>Últimas Adições</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">
              Aqui serão exibidas as últimas adições de filmes e séries ao catálogo.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-movieDark border-gray-800">
          <CardHeader>
            <CardTitle>Atividade de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">
              Aqui serão exibidas estatísticas de atividade dos usuários.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAdmin;
