import React, { useState, useEffect } from 'react';
import V2VipModel from '@/components/V2VipModel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';
import { 
  User, 
  Shield, 
  Eye, 
  CreditCard, 
  FileText, 
  Settings, 
  UserX,
  Phone,
  Mail,
  Lock,
  Bell,
  Globe,
  Download,
  Trash2,
  Edit2,
  Save,
  X,
  EyeOff
} from 'lucide-react';

export default function ClientV2AccountPage() {
  const { user } = useAuth();
  const { data: currentUser, isLoading: currentUserLoading } = useCurrentUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const [userInfo, setUserInfo] = useState({
    email: '',
    name: '',
    whatsapp: '',
    cpf: '',
    password: '',
    confirmPassword: ''
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setUserInfo({
        email: user.email || '',
        name: user.user_metadata?.name || '',
        whatsapp: user.user_metadata?.whatsapp || '',
        cpf: user.user_metadata?.cpf || '',
        password: '',
        confirmPassword: ''
      });

      if (currentUser?.profile_photo_url) {
        setProfilePhotoUrl(currentUser.profile_photo_url);
      } else if (user.user_metadata?.profile_photo_url) {
        setProfilePhotoUrl(user.user_metadata.profile_photo_url);
      }
    }
  }, [user, currentUser]);

  const handleSave = async () => {
    try {
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

      const updateData: any = {
        data: {
          name: userInfo.name,
          whatsapp: userInfo.whatsapp,
          cpf: userInfo.cpf
        }
      };

      if (userInfo.email !== user?.email) {
        updateData.email = userInfo.email;
      }

      if (userInfo.password) {
        updateData.password = userInfo.password;
      }

      const { error } = await supabase.auth.updateUser(updateData);
      
      if (error) {
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
    setUserInfo({
      email: user?.email || '',
      name: user?.user_metadata?.name || '',
      whatsapp: user?.user_metadata?.whatsapp || '',
      cpf: user?.user_metadata?.cpf || '',
      password: '',
      confirmPassword: ''
    });
    setIsEditing(false);
  };

  const handlePhotoUpdate = (photoUrl: string) => {
    setProfilePhotoUrl(photoUrl);
    toast({
      title: "Sucesso",
      description: "Foto de perfil atualizada!"
    });
  };

  return (
    <V2VipModel title="Minha Conta" subtitle="Gerencie todas as configurações da sua conta" activeId="account">
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full bg-muted/50">
            <TabsTrigger value="personal" className="flex items-center gap-1 px-2 py-3 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="hidden xs:inline truncate">Dados Pessoais</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1 px-2 py-3 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <Shield className="h-4 w-4 flex-shrink-0" />
              <span className="hidden xs:inline truncate">Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-1 px-2 py-3 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <Eye className="h-4 w-4 flex-shrink-0" />
              <span className="hidden xs:inline truncate">Privacidade</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-1 px-2 py-3 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <CreditCard className="h-4 w-4 flex-shrink-0" />
              <span className="hidden xs:inline truncate">Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-1 px-2 py-3 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span className="hidden xs:inline truncate">Recursos</span>
            </TabsTrigger>
          </TabsList>

          {/* Dados Pessoais */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo Section */}
                <div className="flex flex-col items-center space-y-4">
                  <ProfilePhotoUpload size="lg" />
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">
                      {currentUser?.name || userInfo.name || 'Usuário'}
                    </h3>
                    <p className="text-muted-foreground capitalize">
                      {currentUser?.user_role || 'Cliente'}
                    </p>
                  </div>
                </div>

                {/* User Information Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        type="text"
                        value={userInfo.name}
                        onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Digite seu nome"
                        className="disabled:opacity-60"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userInfo.email}
                        onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                        disabled={!isEditing}
                        className="disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={userInfo.whatsapp}
                      onChange={(e) => setUserInfo({ ...userInfo, whatsapp: e.target.value })}
                      disabled={!isEditing}
                      placeholder="(11) 99999-9999"
                      className="disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF <span className="text-red-500">*</span></Label>
                    <Input
                      id="cpf"
                      type="text"
                      value={userInfo.cpf}
                      onChange={(e) => setUserInfo({ ...userInfo, cpf: e.target.value })}
                      disabled={!isEditing}
                      placeholder="000.000.000-00"
                      className="disabled:opacity-60"
                    />
                    <p className="text-xs text-muted-foreground">
                      CPF obrigatório para transações PIX
                    </p>
                  </div>

                  {isEditing && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="password">Nova Senha (opcional)</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={userInfo.password}
                            onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
                            placeholder="Digite uma nova senha"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
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
                        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={userInfo.confirmPassword}
                          onChange={(e) => setUserInfo({ ...userInfo, confirmPassword: e.target.value })}
                          placeholder="Confirme a nova senha"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Plano Ativo</Label>
                    <div className="p-3 bg-muted rounded-md">
                      {currentUser?.plan_id ? (
                        <span className="text-green-600 font-medium">
                          Plano Ativo
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Nenhum plano ativo</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    {!isEditing ? (
                      <Button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        Editar Informações
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleSave}
                          className="flex items-center gap-2 flex-1"
                        >
                          <Save className="h-4 w-4" />
                          Salvar
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCancel}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segurança */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Segurança da Conta</CardTitle>
                <CardDescription>
                  Gerencie a segurança e autenticação da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Alterar Senha</Label>
                      <p className="text-sm text-muted-foreground">
                        Última alteração há 30 dias
                      </p>
                    </div>
                    <Button variant="outline">
                      <Lock className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Autenticação de Dois Fatores</Label>
                      <p className="text-sm text-muted-foreground">
                        Adicione uma camada extra de segurança
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Verificação por SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba códigos de verificação por SMS
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessões Ativas</CardTitle>
                <CardDescription>
                  Gerencie onde sua conta está conectada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Chrome - Windows</p>
                      <p className="text-sm text-muted-foreground">Atual • São Paulo, Brasil</p>
                    </div>
                    <Button variant="outline" size="sm">Encerrar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacidade */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Privacidade</CardTitle>
                <CardDescription>
                  Controle quem pode ver suas informações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Perfil Público</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite que outros usuários vejam seu perfil
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Mostrar Status Online</Label>
                      <p className="text-sm text-muted-foreground">
                        Outros podem ver quando você está online
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Receber Mensagens de Desconhecidos</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite que usuários não conectados te enviem mensagens
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financeiro */}
          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Financeiras</CardTitle>
                <CardDescription>
                  Gerencie seus métodos de pagamento e dados fiscais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pix">Chave PIX (opcional)</Label>
                    <Input id="pix" placeholder="Sua chave PIX preferida" />
                    <p className="text-xs text-muted-foreground">
                      Para receber pagamentos via PIX
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank">Dados Bancários (opcional)</Label>
                    <Textarea id="bank" placeholder="Banco, agência, conta..." />
                  </div>
                </div>

                <Button>Salvar Informações</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
                <CardDescription>
                  Visualize suas transações recentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Recursos e Preferências */}
          <TabsContent value="preferences" className="space-y-6">
            {/* Módulos e Recursos */}
            <Card>
              <CardHeader>
                <CardTitle>Módulos e Recursos</CardTitle>
                <CardDescription>
                  Nossa plataforma é perfeita para suas necessidades. Os módulos e recursos funcionam de maneira separada ou integrada, oferecendo máxima flexibilidade.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Módulos Principais</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-green-600 mb-3">Ativos em sua conta:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {["Prive Account", "Prive Model", "Prive Bank", "Prive Chat", "Prive ServiceBooking", "Prive Cloud"].map((module) => (
                          <div key={module} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors bg-green-50 border-green-200">
                            <span className="text-sm font-medium text-green-700">{module}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-orange-600 mb-3">Ainda não disponíveis:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {["Prive Date", "Prive Delivery", "Prive Trust", "Prive Intelligence"].map((module) => (
                          <div key={module} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors bg-orange-50 border-orange-200">
                            <span className="text-sm font-medium text-orange-700">{module}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferências Gerais</CardTitle>
                <CardDescription>
                  Personalize sua experiência na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Notificações por E-mail</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba atualizações importantes por e-mail
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações no navegador
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Tema Escuro</Label>
                      <p className="text-sm text-muted-foreground">
                        Ative o modo escuro da interface
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Idioma</Label>
                      <p className="text-sm text-muted-foreground">
                        Português (Brasil)
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Globe className="h-4 w-4 mr-2" />
                      Alterar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </V2VipModel>
  );
}