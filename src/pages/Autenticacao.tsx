import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Autenticacao = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [form, setForm] = useState<'login' | 'cadastro'>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  const alternarForm = () => {
    setForm(form === 'login' ? 'cadastro' : 'login');
    setErro(null);
  };

  const validarFormulario = () => {
    setErro(null);

    if (!email || !senha) {
      setErro("Por favor, preencha todos os campos");
      return false;
    }

    if (form === 'cadastro') {
      if (!nome) {
        setErro("Por favor, informe seu nome");
        return false;
      }
      
      if (senha.length < 6) {
        setErro("A senha deve ter pelo menos 6 caracteres");
        return false;
      }
      
      if (senha !== confirmarSenha) {
        setErro("As senhas não coincidem");
        return false;
      }
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    
    setCarregando(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setErro('Email não confirmado. Por favor, verifique sua caixa de entrada.');
          toast.error('Email não confirmado!');
        } else if (error.message.includes('Invalid login credentials')) {
          setErro('Email ou senha incorretos');
          toast.error('Credenciais inválidas!');
        } else {
          throw error;
        }
        return;
      }
      
      toast.success('Login realizado com sucesso!');
      navigate('/');
      
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      
      setErro('Ocorreu um erro ao fazer login. Tente novamente.');
      toast.error('Erro ao fazer login');
      
    } finally {
      setCarregando(false);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    
    setCarregando(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome: nome
          }
        }
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          setErro('Este email já está cadastrado');
          toast.error('Email já cadastrado!');
        } else {
          throw error;
        }
        return;
      }
      
      toast.success('Cadastro realizado com sucesso!');
      toast.info('Verifique seu email para confirmar seu cadastro');
      setForm('login');
      
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      
      setErro('Ocorreu um erro ao realizar o cadastro. Tente novamente.');
      toast.error('Erro ao cadastrar');
      
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center" 
           style={{ backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/c0b69670-89a3-48ca-877f-45ba7a60c16f/2642e08e-4202-490e-8e93-aff04881ee8a/BR-pt-20240212-popsignuptwoweeks-perspective_alpha_website_small.jpg')" }}>
        <div className="w-full h-full bg-black/60 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-4xl font-bold mb-6">Bem-vindo ao Cineflix</h1>
          <p className="text-xl text-center">
            Milhares de filmes e séries para assistir quando e onde quiser.
          </p>
        </div>
      </div>
      
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-movieDarkBlue">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <span className="text-white text-3xl font-bold">Cineflix</span>
            <div className="ml-1 w-6 h-6 bg-movieRed rotate-45 relative">
              <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                <span className="text-white text-lg font-bold">+</span>
              </div>
            </div>
          </div>
          
          <div className="bg-movieDark rounded-lg p-8 shadow-lg border border-gray-800">
            <h2 className="text-white text-center text-2xl font-bold mb-6">
              {form === 'login' ? 'Entrar' : 'Criar conta'}
            </h2>
            
            <form onSubmit={form === 'login' ? handleLogin : handleCadastro}>
              {erro && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded-md text-red-200 text-sm">
                  {erro}
                </div>
              )}
              
              {form === 'cadastro' && (
                <div className="mb-4">
                  <label htmlFor="nome" className="block text-gray-300 text-sm font-medium mb-2">
                    Nome
                  </label>
                  <Input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                    placeholder="Seu nome completo"
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 pl-10"
                    placeholder="seu.email@exemplo.com"
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="senha" className="block text-gray-300 text-sm font-medium mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 pl-10 pr-10"
                    placeholder="********"
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-2.5 text-gray-500"
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {form === 'cadastro' && (
                <div className="mb-4">
                  <label htmlFor="confirmarSenha" className="block text-gray-300 text-sm font-medium mb-2">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      type={mostrarSenha ? "text" : "password"}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 pl-10"
                      placeholder="********"
                    />
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                  </div>
                </div>
              )}
              
              {form === 'login' && (
                <div className="flex items-center justify-end mb-4">
                  <a href="#" className="text-movieRed text-sm hover:underline">
                    Esqueceu a senha?
                  </a>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={carregando}
                className="w-full bg-movieRed hover:bg-red-700 text-white py-2 px-4 rounded-md transition-all"
              >
                {carregando ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : null}
                {form === 'login' ? 'Entrar' : 'Criar conta'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-300">
                {form === 'login' ? "Não tem uma conta?" : "Já tem uma conta?"}
                <button
                  onClick={alternarForm}
                  className="ml-1 text-movieRed hover:underline"
                >
                  {form === 'login' ? 'Cadastre-se' : 'Entrar'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Autenticacao;
