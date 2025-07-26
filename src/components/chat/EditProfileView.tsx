import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';

interface EditProfileViewProps {
  onBack: () => void;
}

const EditProfileView: React.FC<EditProfileViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { data: currentUser, isLoading: currentUserLoading } = useCurrentUser();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        // Carregar dados básicos do auth
        const basicInfo = {
          email: user.email || '',
          name: user.user_metadata?.name || '',
          whatsapp: user.user_metadata?.whatsapp || '',
          password: '',
          confirmPassword: '',
        };

        setUserInfo(basicInfo);
      } catch (error) {
        console.error('Error loading user data:', error);
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

  const handleSave = async () => {
    setSaving(true);
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

      // Voltar para a tela anterior
      onBack();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as informações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
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
    onBack();
  };

  if (loading || currentUserLoading) {
    return (
      <div className="h-full bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-zinc-100">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
            <X className="h-8 w-8 text-zinc-400" />
          </div>
          <div className="text-zinc-400">Usuário não encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-sm">
        <div className="flex items-center px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-white">Editar Perfil</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center space-y-4 py-6">
            <ProfilePhotoUpload size="lg" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">
                {userInfo.name || 'Usuário'}
              </h3>
              <p className="text-zinc-400 text-sm">{userInfo.email}</p>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300 text-sm font-medium">
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  placeholder="Digite seu nome"
                  className="bg-zinc-800/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 focus:ring-purple-500/20"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300 text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className="bg-zinc-800/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 focus:ring-purple-500/20"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-zinc-300 text-sm font-medium">
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={userInfo.whatsapp}
                  onChange={(e) => setUserInfo({ ...userInfo, whatsapp: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="bg-zinc-800/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 focus:ring-purple-500/20"
                  autoComplete="tel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300 text-sm font-medium">
                  Nova Senha (opcional)
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={userInfo.password}
                    onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
                    placeholder="Digite uma nova senha"
                    className="bg-zinc-800/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 pr-10 focus:border-purple-500 focus:ring-purple-500/20"
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-zinc-400 hover:text-zinc-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-zinc-300 text-sm font-medium">
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={userInfo.confirmPassword}
                  onChange={(e) => setUserInfo({ ...userInfo, confirmPassword: e.target.value })}
                  placeholder="Confirme a nova senha"
                  className="bg-zinc-800/70 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 focus:ring-purple-500/20"
                  autoComplete="new-password"
                />
              </div>
            </form>
          </div>

          {/* Plan Info Card */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm font-medium">
                Plano Ativo
              </Label>
              <div className="bg-zinc-800/70 border border-zinc-700 rounded-lg px-4 py-3">
                {currentUser?.plan ? (
                  <span className="text-green-400 font-medium">
                    {currentUser.plan.name} - R$ {Number(currentUser.plan.price).toFixed(2)}
                  </span>
                ) : currentUser ? (
                  <span className="text-yellow-400 font-medium">Nenhum plano ativo</span>
                ) : (
                  <span className="text-zinc-500">Carregando...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Actions Bar */}
      <div className="border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm p-4">
        <div className="flex space-x-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileView;