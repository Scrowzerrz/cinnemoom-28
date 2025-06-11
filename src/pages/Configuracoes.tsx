
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Configuracoes = () => {
  const { perfil } = useAuth();
  const navigate = useNavigate();

  const [salvando, setSalvando] = useState(false);

  // Estados para as configurações
  const [configuracoes, setConfiguracoes] = useState({
    autoPlay: true
  });

  const handleChange = (name: string, value: boolean) => {
    setConfiguracoes(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Configurações salvas com sucesso!');
      console.log('Configurações salvas:', configuracoes);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  };

  if (!perfil) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-movieDarkBlue pt-24 px-4 pb-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Configurações</h1>
        
        <Card className="bg-movieDark border-movieGray/20">
          <form onSubmit={handleSalvar}>
            <CardHeader>
              <CardTitle className="text-white">Configurações Gerais</CardTitle>
              <CardDescription className="text-gray-400">
                Personalize sua experiência no Cineflix
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="autoplay" className="text-white">Reprodução Automática</Label>
                  <p className="text-xs text-gray-400">Iniciar próximo episódio automaticamente</p>
                </div>
                <Switch
                  id="autoplay"
                  checked={configuracoes.autoPlay}
                  onCheckedChange={(checked) => handleChange('autoPlay', checked)}
                  className="data-[state=checked]:bg-movieRed"
                />
              </div>
            </CardContent>
            <div className="p-6 pt-0 flex justify-end">
              <Button 
                type="submit" 
                className="bg-movieRed hover:bg-red-700 text-white"
                disabled={salvando}
              >
                {salvando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Configuracoes;
