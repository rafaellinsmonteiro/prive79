
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Verificar se são as credenciais do admin
    if (email === 'admin' && password === 'admin') {
      // Salvar estado de autenticação
      localStorage.setItem('adminAuth', 'true');
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao dashboard administrativo",
      });
      navigate('/admin');
    } else {
      toast({
        title: "Erro no login",
        description: "Usuário ou senha inválidos",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-2xl font-bold text-pink-500">
              Privé<span className="text-zinc-100">79</span>
            </h1>
          </div>
          <CardTitle className="text-zinc-100">Login Administrativo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Usuário
              </Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu usuário"
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white"
            >
              {loading ? (
                "Entrando..."
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-zinc-800 rounded-md">
            <p className="text-zinc-400 text-sm text-center">
              <strong>Credenciais de acesso:</strong><br />
              Usuário: admin<br />
              Senha: admin
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
