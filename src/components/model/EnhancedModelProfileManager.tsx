import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCities } from '@/hooks/useCities';
import { useCustomFields, useCustomSections } from '@/hooks/useCustomFields';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { User, Heart, Settings, Eye, Edit2, Save, X, EyeOff } from 'lucide-react';
interface EnhancedModelProfileManagerProps {
  profile: any;
}
const EnhancedModelProfileManager = ({
  profile
}: EnhancedModelProfileManagerProps) => {
  const { user } = useAuth();
  const { data: currentUser } = useCurrentUser();
  
  // Add loading state check
  if (!profile || !profile.models) {
    return <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Carregando perfil...
          </div>
        </CardContent>
      </Card>;
  }
  const [formData, setFormData] = useState({
    // Informações básicas
    name: profile.models?.name || '',
    age: profile.models?.age || '',
    city_id: profile.models?.city_id || '',
    neighborhood: profile.models?.neighborhood || '',
    description: profile.models?.description || '',
    whatsapp_number: profile.models?.whatsapp_number || '',
    // Características físicas
    height: profile.models?.height || '',
    weight: profile.models?.weight || '',
    bust: profile.models?.bust || '',
    waist: profile.models?.waist || '',
    hip: profile.models?.hip || '',
    body_type: profile.models?.body_type || '',
    eyes: profile.models?.eyes || '',
    shoe_size: profile.models?.shoe_size || '',
    silicone: profile.models?.silicone || false,
    // Campos integrados
    olhos: profile.models?.olhos || '',
    cabelo: profile.models?.cabelo || '',
    etnia: profile.models?.etnia || '',
    tatuagem: profile.models?.tatuagem || false,
    // Configurações
    is_active: profile.models?.is_active !== false,
    languages: profile.models?.languages || ''
  });

  // Estados para o perfil básico do usuário
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: '',
    name: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
  });
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();
  const {
    data: cities = []
  } = useCities();
  const {
    data: customFields = []
  } = useCustomFields();
  const {
    data: customSections = []
  } = useCustomSections();

  // Carregar dados dos campos personalizados
  useEffect(() => {
    if (profile.models && customFields.length > 0) {
      const customData: Record<string, any> = {};
      customFields.forEach(field => {
        const value = (profile.models as any)[field.field_name];
        if (value !== undefined && value !== null) {
          customData[field.field_name] = value;
        }
      });
      setCustomFieldsData(customData);
    }
  }, [profile.models, customFields]);

  // Carregar informações básicas do usuário
  useEffect(() => {
    if (user) {
      setUserInfo({
        email: user.email || '',
        name: user.user_metadata?.name || '',
        whatsapp: user.user_metadata?.whatsapp || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);
  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const {
        error
      } = await supabase.from('models').update(data).eq('id', profile.model_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['model-profile']
      });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: error => {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData = {
      ...formData,
      age: parseInt(formData.age) || null,
      ...customFieldsData
    };
    updateProfile.mutate(updateData);
  };
  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFieldsData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Funções para o perfil básico
  const handleSaveBasic = async () => {
    try {
      // Validações básicas
      if (userInfo.password && userInfo.password !== userInfo.confirmPassword) {
        toast.error('As senhas não coincidem');
        return;
      }

      if (userInfo.password && userInfo.password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres');
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
        toast.error(error.message);
        return;
      }

      toast.success('Perfil básico atualizado com sucesso!');

      // Limpar senha dos campos
      setUserInfo(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));

      setIsEditingBasic(false);
    } catch (error) {
      console.error('Erro ao salvar perfil básico:', error);
      toast.error('Ocorreu um erro ao salvar as informações');
    }
  };

  const handleCancelBasic = () => {
    // Restaurar dados originais
    setUserInfo({
      email: user?.email || '',
      name: user?.user_metadata?.name || '',
      whatsapp: user?.user_metadata?.whatsapp || '',
      password: '',
      confirmPassword: '',
    });
    setIsEditingBasic(false);
  };
  const renderCustomField = (field: any) => {
    const value = customFieldsData[field.field_name] || '';
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'url':
        return <Input value={value} onChange={e => handleCustomFieldChange(field.field_name, e.target.value)} placeholder={field.placeholder || ''} className="bg-zinc-800 border-zinc-700 text-white" />;
      case 'textarea':
        return <Textarea value={value} onChange={e => handleCustomFieldChange(field.field_name, e.target.value)} placeholder={field.placeholder || ''} className="bg-zinc-800 border-zinc-700 text-white" rows={3} />;
      case 'number':
        return <Input type="number" value={value} onChange={e => handleCustomFieldChange(field.field_name, parseFloat(e.target.value) || '')} placeholder={field.placeholder || ''} className="bg-zinc-800 border-zinc-700 text-white" />;
      case 'boolean':
        return <Switch checked={!!value} onCheckedChange={checked => handleCustomFieldChange(field.field_name, checked)} />;
      case 'select':
        return <Select value={value} onValueChange={val => handleCustomFieldChange(field.field_name, val)}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>)}
            </SelectContent>
          </Select>;
      case 'date':
        return <Input type="date" value={value} onChange={e => handleCustomFieldChange(field.field_name, e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />;
      default:
        return <Input value={value} onChange={e => handleCustomFieldChange(field.field_name, e.target.value)} placeholder={field.placeholder || ''} className="bg-zinc-800 border-zinc-700 text-white" />;
    }
  };
  const getSectionFields = (sectionName: string) => {
    return customFields.filter(field => field.is_active && field.section === sectionName).sort((a, b) => a.display_order - b.display_order);
  };
  const activeSections = customSections.filter(section => section.is_active).sort((a, b) => a.display_order - b.display_order);
  return <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Meu Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="custom">Informações para Anúncios</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-6">
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informações Básicas da Conta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="userName" className="text-zinc-300">Nome</Label>
                        <Input
                          id="userName"
                          type="text"
                          value={userInfo.name}
                          onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                          disabled={!isEditingBasic}
                          placeholder="Digite seu nome"
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 disabled:opacity-60"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="userEmail" className="text-zinc-300">Email</Label>
                        <Input
                          id="userEmail"
                          type="email"
                          value={userInfo.email}
                          onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                          disabled={!isEditingBasic}
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 disabled:opacity-60"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="userWhatsapp" className="text-zinc-300">WhatsApp</Label>
                        <Input
                          id="userWhatsapp"
                          type="tel"
                          value={userInfo.whatsapp}
                          onChange={(e) => setUserInfo({ ...userInfo, whatsapp: e.target.value })}
                          disabled={!isEditingBasic}
                          placeholder="(11) 99999-9999"
                          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 disabled:opacity-60"
                        />
                      </div>

                      {isEditingBasic && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="userPassword" className="text-zinc-300">Nova Senha (opcional)</Label>
                            <div className="relative">
                              <Input
                                id="userPassword"
                                type={showPassword ? "text" : "password"}
                                value={userInfo.password}
                                onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
                                placeholder="Digite uma nova senha"
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
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
                            <Label htmlFor="userConfirmPassword" className="text-zinc-300">Confirmar Nova Senha</Label>
                            <Input
                              id="userConfirmPassword"
                              type="password"
                              value={userInfo.confirmPassword}
                              onChange={(e) => setUserInfo({ ...userInfo, confirmPassword: e.target.value })}
                              placeholder="Confirme a nova senha"
                              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                            />
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <Label className="text-zinc-300">Plano Ativo</Label>
                        <div className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white">
                          {currentUser?.plan ? (
                            <span className="text-green-400">
                              {currentUser.plan.name} - R$ {Number(currentUser.plan.price).toFixed(2)}
                            </span>
                          ) : currentUser ? (
                            <span className="text-yellow-400">Nenhum plano ativo</span>
                          ) : (
                            <span className="text-zinc-500">Carregando...</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        {!isEditingBasic ? (
                          <Button
                            type="button"
                            onClick={() => setIsEditingBasic(true)}
                            variant="outline"
                            className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Editar Informações
                          </Button>
                        ) : (
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              onClick={handleSaveBasic}
                              className="flex-1"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Salvar
                            </Button>
                            <Button
                              type="button"
                              onClick={handleCancelBasic}
                              variant="outline"
                              className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>


              <TabsContent value="custom" className="space-y-6 mt-6">
                {activeSections.map(section => {
                const sectionFields = getSectionFields(section.name);
                if (sectionFields.length === 0) return null;
                return <Card key={section.id} className="bg-zinc-800 border-zinc-700">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">{section.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {sectionFields.map(field => <div key={field.id}>
                              <Label className="text-zinc-300">
                                {field.label}
                                {field.is_required && <span className="text-red-400 ml-1">*</span>}
                              </Label>
                              {renderCustomField(field)}
                              {field.help_text && <p className="text-xs text-zinc-500 mt-1">{field.help_text}</p>}
                            </div>)}
                        </div>
                      </CardContent>
                    </Card>;
              })}
                
                {activeSections.length === 0 && <div className="text-center text-zinc-400 py-8">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum campo personalizado disponível</p>
                  </div>}

                <Button type="submit" disabled={updateProfile.isPending} className="w-full">
                  {updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações do Modelo'}
                </Button>
              </TabsContent>

            </Tabs>
          </form>
        </CardContent>
      </Card>
    </div>;
};
export default EnhancedModelProfileManager;