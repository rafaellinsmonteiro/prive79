
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  const {
    signIn,
    user,
    isAdmin,
    authComplete,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  // Redirect users based on their role when authentication is complete
  useEffect(() => {
    if (authComplete && user) {
      console.log('Auth complete, user:', user.email, 'isAdmin:', isAdmin);
      if (isAdmin) {
        console.log('Redirecting admin to /admin');
        navigate('/admin');
      } else {
        console.log('Redirecting user to home page');
        navigate('/');
      }
    }
  }, [authComplete, user, isAdmin, navigate]);

  // Show loading while auth is being checked
  if (authLoading || user && !authComplete) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">
          {user ? 'Verificando permissões...' : 'Verificando autenticação...'}
        </div>
      </div>;
  }

  // Don't render the form if user is authenticated and auth is complete
  if (user && authComplete) {
    return null;
  }
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await signIn(email, password);
    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    } else {
      toast({
        title: "Login realizado com sucesso",
        description: "Verificando permissões..."
      });
      // Don't set loading to false here - let useEffect handle the redirect
    }
  };
  return <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <a href="/">
              <img src="/lovable-uploads/97e61247-cb21-4158-8ebe-519e4fbec3e1.png" alt="Privé79 Logo" className="h-10" />
            </a>
          </div>
          <CardTitle className="text-zinc-100">Entre em sua conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Digite seu email" required className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Senha
              </Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite sua senha" required className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Entrando..." : <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>;
};
export default Login;
