
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useUsuarioAdmin } from '@/hooks/useUsuarioAdmin';
import { BuscadorUsuarios } from '@/components/admin/usuario/BuscadorUsuarios';
import { TabelaUsuarios } from '@/components/admin/usuario/TabelaUsuarios';
import { PaginacaoUsuarios } from '@/components/admin/usuario/PaginacaoUsuarios';

const GerenciarUsuarios = () => {
  const { usuarios, carregando, alternarAdmin, carregarUsuarios } = useUsuarioAdmin();
  const [termo, setTermo] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  const usuariosFiltrados = usuarios.filter(usuario => 
    (usuario.nome?.toLowerCase().includes(termo.toLowerCase()) || 
    usuario.email.toLowerCase().includes(termo.toLowerCase()))
  );

  const totalPaginas = Math.ceil(usuariosFiltrados.length / itensPorPagina);
  const indiceFinal = paginaAtual * itensPorPagina;
  const indiceInicial = indiceFinal - itensPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indiceInicial, indiceFinal);
  
  // Recarregar usuários quando o componente montar
  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <div>
      <BuscadorUsuarios 
        termo={termo}
        onChange={setTermo}
      />
      
      <Card className="bg-movieDark border-gray-800 overflow-hidden">
        <TabelaUsuarios 
          usuarios={usuariosPaginados}
          carregando={carregando}
          alternarAdmin={alternarAdmin}
        />
        
        {/* Paginação */}
        <PaginacaoUsuarios
          totalItems={usuariosFiltrados.length}
          itensPorPagina={itensPorPagina}
          paginaAtual={paginaAtual}
          onMudarPagina={setPaginaAtual}
        />
      </Card>
    </div>
  );
};

export default GerenciarUsuarios;
