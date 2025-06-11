
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { FilmeDB } from '@/services/types/movieTypes';
import { GerenciarFilmesHeader } from '@/components/admin/filme/GerenciarFilmesHeader';
import { TabelaFilmes } from '@/components/admin/filme/TabelaFilmes';
import { PaginacaoFilmes } from '@/components/admin/filme/PaginacaoFilmes';

const GerenciarFilmes = () => {
  const [filmes, setFilmes] = useState<FilmeDB[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [termo, setTermo] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  useEffect(() => {
    carregarFilmes();
  }, []);

  const carregarFilmes = async () => {
    setCarregando(true);
    
    try {
      let query = supabase
        .from('filmes')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setFilmes(data || []);
    } catch (erro) {
      console.error("Erro ao carregar filmes:", erro);
      toast.error("Erro ao carregar lista de filmes");
    } finally {
      setCarregando(false);
    }
  };

  const filmesFiltrados = filmes.filter(filme => 
    filme.titulo.toLowerCase().includes(termo.toLowerCase())
  );

  const indiceFinal = paginaAtual * itensPorPagina;
  const indiceInicial = indiceFinal - itensPorPagina;
  const filmesPaginados = filmesFiltrados.slice(indiceInicial, indiceFinal);

  return (
    <div>
      <GerenciarFilmesHeader 
        termo={termo} 
        onChangeTermo={setTermo} 
      />
      
      <Card className="bg-movieDark border-gray-800 overflow-hidden">
        <TabelaFilmes 
          filmes={filmesPaginados}
          carregando={carregando}
          onAtualizarFilmes={carregarFilmes}
        />
        
        <PaginacaoFilmes 
          totalItems={filmesFiltrados.length}
          itensPorPagina={itensPorPagina}
          paginaAtual={paginaAtual}
          onMudarPagina={setPaginaAtual}
        />
      </Card>
    </div>
  );
};

export default GerenciarFilmes;
