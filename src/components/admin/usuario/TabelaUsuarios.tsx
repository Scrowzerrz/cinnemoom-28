
import { UserCircle, Shield, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Usuario {
  id: string;
  nome: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
  eh_admin: boolean;
}

interface TabelaUsuariosProps {
  usuarios: Usuario[];
  carregando: boolean;
  alternarAdmin: (usuario: Usuario) => void; // Signature in parent changes, TabelaUsuarios still calls it with 'usuario'
  onDeleteUserRequested: (userId: string, userName?: string) => void; // New prop
}

export function TabelaUsuarios({ usuarios, carregando, alternarAdmin, onDeleteUserRequested }: TabelaUsuariosProps) {
  console.log("Renderizando tabela de usuários com", usuarios.length, "usuários:", usuarios);
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-4 font-medium">Usuário</th>
            <th className="text-left py-3 px-4 font-medium w-48">Email</th>
            <th className="text-left py-3 px-4 font-medium w-36">Cadastrado em</th>
            <th className="text-left py-3 px-4 font-medium w-32">Admin</th>
            <th className="text-left py-3 px-4 font-medium w-32">Ações</th>
          </tr>
        </thead>
        <tbody>
          {carregando ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="border-b border-gray-800">
                <td className="py-3 px-4">
                  <div className="h-6 w-full bg-gray-700 animate-pulse rounded"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="h-6 w-full bg-gray-700 animate-pulse rounded"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="h-6 w-full bg-gray-700 animate-pulse rounded"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="h-6 w-10 bg-gray-700 animate-pulse rounded"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="h-6 w-20 bg-gray-700 animate-pulse rounded"></div>
                </td>
              </tr>
            ))
          ) : usuarios.length > 0 ? (
            usuarios.map((usuario) => (
              <tr key={usuario.id} className="border-b border-gray-800 hover:bg-movieDarkBlue/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">{usuario.nome || 'Sem nome'}</span>
                    {usuario.eh_admin && (
                      <Shield className="h-4 w-4 text-movieRed fill-movieRed" />
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300">{usuario.email}</td>
                <td className="py-3 px-4 text-gray-400">
                  {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Switch 
                      id={`admin-${usuario.id}`}
                      checked={usuario.eh_admin}
                      onCheckedChange={() => alternarAdmin(usuario)}
                      disabled={carregando}
                      className="data-[state=checked]:bg-movieRed"
                    />
                    <Label 
                      htmlFor={`admin-${usuario.id}`}
                      className="text-xs text-gray-400"
                    >
                      {usuario.eh_admin ? 'Ativo' : 'Inativo'}
                    </Label>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-700 gap-1"
                      >
                        <span>Ações</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      className="bg-movieDark border border-gray-700"
                    >
                      <DropdownMenuItem 
                        className="hover:bg-movieDarkBlue cursor-pointer flex items-center gap-2"
                      >
                        <UserCircle className="h-4 w-4" />
                        <span>Ver perfil</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="hover:bg-red-900/30 text-red-400 cursor-pointer flex items-center gap-2"
                        onClick={() => onDeleteUserRequested(usuario.id, usuario.nome || usuario.email)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Excluir conta</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-4 px-4 text-center text-gray-400">
                Nenhum usuário encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
