
import { useState, useEffect } from 'react'; // useState already here
import { Card } from '@/components/ui/card';
import { useUsuarioAdmin, Usuario } from '@/hooks/useUsuarioAdmin'; // Assuming Usuario type is exported
import { toast } from 'sonner'; // For placeholder delete
import { PasswordConfirmationModal } from '@/components/modals/PasswordConfirmationModal'; // Uncommented
import { useAuth } from '@/hooks/useAuth'; // Added
import { supabase } from '@/integrations/supabase/client'; // Added
import { BuscadorUsuarios } from '@/components/admin/usuario/BuscadorUsuarios';
import { TabelaUsuarios } from '@/components/admin/usuario/TabelaUsuarios';
import { PaginacaoUsuarios } from '@/components/admin/usuario/PaginacaoUsuarios';

const GerenciarUsuarios = () => {
  const { session } = useAuth(); // Added
  const { usuarios, carregando, alternarAdmin: hookAlternarAdmin, carregarUsuarios } = useUsuarioAdmin();
  const [termo, setTermo] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<(() => Promise<void>) | null>(null);
  const [modalMessage, setModalMessage] = useState('');

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
  }, [carregarUsuarios]); // Added carregarUsuarios to dependency array

  const handleAlternarAdminRequest = (usuario: Usuario) => {
    setModalMessage(`Para sua segurança, insira sua senha para ${usuario.eh_admin ? 'remover as permissões de' : 'conceder permissões de'} administrador para ${usuario.nome || usuario.email}.`);
    setActionToConfirm(() => async () => {
      await hookAlternarAdmin(usuario);
      // carregarUsuarios(); // or rely on hookAlternarAdmin to update list
    });
    setIsPasswordModalOpen(true);
  };

  const handleDeleteUserRequest = (userId: string, userName?: string) => {
    setModalMessage(`Para sua segurança, insira sua senha para EXCLUIR PERMANENTEMENTE o usuário ${userName || userId}. Esta ação não pode ser desfeita.`);
    setActionToConfirm(() => async () => {
      // TODO: Implement actual user deletion logic here
      // For example: await supabase.from('users').delete().eq('id', userId);
      // Ensure RLS allows this or use a service role / rpc function.
      // Also, consider what happens to user's related data.
      console.log(`Password confirmed for deleting user ${userId}`);
      toast.warn(`A exclusão do usuário ${userName || userId} prosseguiria aqui.`);
      // carregarUsuarios(); // Refresh list after deletion
    });
    setIsPasswordModalOpen(true);
  };

  return (
    <div> {/* or React.Fragment */}
      <BuscadorUsuarios 
        termo={termo}
        onChange={setTermo}
      />
      
      <Card className="bg-movieDark border-gray-800 overflow-hidden">
        <TabelaUsuarios 
          usuarios={usuariosPaginados}
          carregando={carregando}
          alternarAdmin={handleAlternarAdminRequest} // Pass the new handler
          onDeleteUserRequested={handleDeleteUserRequest} // Pass new handler for delete
        />
        
        {/* Paginação */}
        <PaginacaoUsuarios
          totalItems={usuariosFiltrados.length}
          itensPorPagina={itensPorPagina}
          paginaAtual={paginaAtual}
          onMudarPagina={setPaginaAtual}
        />
      </Card>

      {isPasswordModalOpen && actionToConfirm && (
        <PasswordConfirmationModal
          isOpen={isPasswordModalOpen}
          message={modalMessage}
          title="Confirmação de Ação do Administrador"
          onClose={() => {
            setIsPasswordModalOpen(false);
            setActionToConfirm(null);
            setModalMessage(''); // Reset the dynamic message
          }}
          onConfirm={async (enteredPassword: string) => {
            if (!session?.user?.email) {
              toast.error("Usuário não autenticado. Não é possível verificar a senha.");
              throw new Error("Usuário não autenticado.");
            }
            if (!actionToConfirm) { // Should not happen if modal is open correctly
               toast.error("Nenhuma ação para confirmar.");
               throw new Error("Ação a ser confirmada ausente.");
            }
  
            // Verify password with Supabase
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: session.user.email,
              password: enteredPassword,
            });
  
            if (signInError) {
              console.error("Erro na verificação de senha:", signInError);
              if (signInError.message === "Invalid login credentials") {
                throw new Error("Senha incorreta. Por favor, tente novamente.");
              }
              throw new Error("Falha na verificação da senha.");
            }
  
            // Password is correct, proceed with the stored action
            await actionToConfirm(); // Execute the stored action (e.g., hookAlternarAdmin or delete logic)
            
            // After action execution, close modal and reset states
            setIsPasswordModalOpen(false);
            setActionToConfirm(null);
            setModalMessage('');
          }}
        />
      )}
    </div>
  );
};

export default GerenciarUsuarios;
