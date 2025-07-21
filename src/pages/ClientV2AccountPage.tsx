import React, { useState } from 'react';
import V2VipModel from '@/components/V2VipModel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  Trash2
} from 'lucide-react';

export default function ClientV2AccountPage() {
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <V2VipModel title="Minha Conta" subtitle="Gerencie todas as configurações da sua conta" activeId="account">
      <div className="p-6">
        {/* Texto explicativo e módulos */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <p className="text-lg text-muted-foreground">
              Nossa plataforma é perfeita para suas necessidades. Os módulos e recursos funcionam de maneira separada ou integrada, oferecendo máxima flexibilidade.
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
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
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Dados Pessoais</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Privacidade</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documentos</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Preferências</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <UserX className="h-4 w-4" />
              <span className="hidden sm:inline">Conta</span>
            </TabsTrigger>
          </TabsList>

          {/* Dados Pessoais */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Nome Completo</Label>
                    <Input id="fullname" placeholder="Seu nome completo" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nickname">Como Podemos Te Chamar</Label>
                    <Input id="nickname" placeholder="Seu apelido ou nome preferido" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" placeholder="(11) 99999-9999" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Data de Nascimento</Label>
                    <Input id="birthdate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-photo">Foto de Perfil</Label>
                    <div className="flex items-center gap-2">
                      <Input id="profile-photo" type="file" accept="image/*" />
                      <Button variant="outline" size="sm">
                        Alterar Foto
                      </Button>
                    </div>
                  </div>
                </div>
                <Button>Salvar Alterações</Button>
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
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" placeholder="000.000.000-00" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pix">Chave PIX</Label>
                    <Input id="pix" placeholder="Sua chave PIX" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank">Dados Bancários</Label>
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

          {/* Documentos */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentos e Verificação</CardTitle>
                <CardDescription>
                  Faça upload e gerencie seus documentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Documento de Identidade</Label>
                      <p className="text-sm text-muted-foreground">
                        RG ou CNH para verificação da conta
                      </p>
                    </div>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Enviar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Comprovante de Residência</Label>
                      <p className="text-sm text-muted-foreground">
                        Conta de luz, água ou telefone
                      </p>
                    </div>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferências */}
          <TabsContent value="preferences" className="space-y-6">
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

          {/* Conta */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Conta</CardTitle>
                <CardDescription>
                  Opções avançadas para sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Exportar Dados</Label>
                      <p className="text-sm text-muted-foreground">
                        Baixe uma cópia de todos os seus dados
                      </p>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Desativar Conta</Label>
                      <p className="text-sm text-muted-foreground">
                        Desative temporariamente sua conta
                      </p>
                    </div>
                    <Button variant="outline">Desativar</Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Excluir Conta</Label>
                      <p className="text-sm text-muted-foreground">
                        Exclua permanentemente sua conta e todos os dados
                      </p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
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