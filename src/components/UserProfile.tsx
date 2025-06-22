
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, LogOut, Edit2, Save, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const UserProfile = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userPlan, setUserPlan] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    email: '',
    name: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
  });

  // Carregar informações do usuário quando o componente monta
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Carregando dados do usuário:', user.id);
        
        // Carregar dados básicos do auth
        const basicInfo = {
          email: user.email || '',
          name: user.user_metadata?.name || '',
          whatsapp: user.user_metadata?.whatsapp || '',
          password: '',
          confirmPassword: '',
        };

        console.log('Dados básicos do auth:', basicInfo);
        setUserInfo(basicInfo);

        // Buscar informações do plano
        await fetchUserPlan();
        
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar informações do usuário",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, toast]);

  // Buscar informações do plano do usuário
  const fetchUserPlan = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Buscando plano para usuário:', user.id);
      console.log('Email do usuário:', user.email);
      
      // Primeiro buscar na tabela system_users pelo user_id
      let { data: systemUserData, error: systemUserError } = await supabase
        .from('system_users')
        .select(`
          plan_id,
          plans (
            name,
            description,
            price
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Resultado busca por user_id:', systemUserData, systemUserError);

      // Se não encontrar por user_id, tentar buscar por email
      if (!systemUserData && !systemUserError) {
        console.log('Tentando buscar por email:', user.email);
        const { data: emailData, error: emailError } = await supabase
          .from('system_users')
          .select(`
            plan_id,
            plans (
              name,
              description,
              price
            )
          `)
          .eq('email', user.email)
          .maybeSingle();

        systemUserData = emailData;
        systemUserError = emailError;
        console.log('Resultado busca por email:', systemUserData, systemUserError);
      }

      if (systemUserError) {
        console.log('Erro ao buscar plano:', systemUserError);
        setUserPlan('Erro ao carregar plano');
        return;
      }

      if (systemUserData?.plans) {
        const plan = systemUserData.plans as any;
        setUserPlan(`${plan.name} - R$ ${plan.price}`);
        console.log('Plano encontrado:', plan);
      } else if (systemUserData?.plan_id) {
        console.log('System user encontrado mas sem dados do plano, plan_id:', systemUserData.plan_id);
        setUserPlan('Plano não encontrado');
      } else {
        setUserPlan('Nenhum plano ativo');
        console.log('Nenhum plano encontrado para o usuário');
      }
    } catch (error) {
      console.error('Erro ao buscar plano:', error);
      setUserPlan('Erro ao carregar plano');
    }
  };

  const handleSignOut = async () => {
    console.log('User profile - signing out');
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
    }
  };

  const handleSave = async () => {
    try {
      // Validações básicas
      if (userInfo.password && userInfo.password !== userInfo.confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem",
          variant: "destructive"
        });
        return;
      }

      if (userInfo.password && userInfo.password.length < 6) {
        toast({
          title: "Erro",
          description: "A senha deve ter pelo menos 6 caracteres",
          variant: "destructive"
        });
        return;
      }

      // Atualizar informações do usuário
      const updateData: any = {
        data: {
          name: userInfo.name,
          whatsapp: userInfo.whatsapp,
        }
      };

      // Se email mudou, incluir na atualização
      if (userInfo.email !== user?.email) {
        updateData.email = userInfo.email;
      }

      // Se senha foi fornecida, incluir na atualização
      if (userInfo.password) {
        updateData.password = userInfo.password;
      }

      console.log('Atualizando usuário com dados:', updateData);

      const { error } = await supabase.auth.updateUser(updateData);

      if (error) {
        console.error('Erro ao atualizar usuário:', error);
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso"
      });

      // Limpar senha dos campos
      setUserInfo(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));

      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as informações",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    // Restaurar dados originais
    setUserInfo({
      email: user?.email || '',
      name: user?.user_metadata?.name || '',
      whatsapp: user?.user_metadata?.whatsapp || '',
      password: '',
      confirmPassword: '',
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="text-center text-zinc-400">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="text-center text-zinc-400">Usuário não encontrado</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <User className="h-8 w-8 text-zinc-400" />
        </div>
        <CardTitle className="text-zinc-100">Perfil do Usuário</CardTitle>
        {isAdmin && (
          <div className="inline-block bg-primary px-2 py-1 rounded text-xs text-white">
            Administrador
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-zinc-300">
            Nome
          </Label>
          <Input
            id="name"
            type="text"
            value={userInfo.name}
            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
            disabled={!isEditing}
            placeholder="Digite seu nome"
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 disabled:opacity-60"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-300">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={userInfo.email}
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
            disabled={!isEditing}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 disabled:opacity-60"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="text-zinc-300">
            WhatsApp
          </Label>
          <Input
            id="whatsapp"
            type="tel"
            value={userInfo.whatsapp}
            onChange={(e) => setUserInfo({ ...userInfo, whatsapp: e.target.value })}
            disabled={!isEditing}
            placeholder="(11) 99999-9999"
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 disabled:opacity-60"
          />
        </div>

        {isEditing && (
          <>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Nova Senha (opcional)
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={userInfo.password}
                  onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
                  placeholder="Digite uma nova senha"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-zinc-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300">
                Confirmar Nova Senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={userInfo.confirmPassword}
                onChange={(e) => setUserInfo({ ...userInfo, confirmPassword: e.target.value })}
                placeholder="Confirme a nova senha"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label className="text-zinc-300">
            Plano Ativo
          </Label>
          <div className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100">
            {userPlan || 'Carregando...'}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          {!isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar Informações
              </Button>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
