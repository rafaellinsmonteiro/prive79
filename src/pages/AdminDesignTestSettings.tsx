import React from 'react';
import DesignTestLayout from '@/components/design-test/DesignTestLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, Bell, Users, Globe, Database, Mail, Palette } from 'lucide-react';

const AdminDesignTestSettings = () => {
  return (
    <DesignTestLayout title="Configurações do Sistema">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-[hsl(var(--dark-card))] border border-[hsl(var(--gold-accent))]/20">
          <TabsTrigger value="general" className="data-[state=active]:bg-[hsl(var(--gold-primary))] data-[state=active]:text-[hsl(var(--dark-primary))]">
            <Settings className="h-4 w-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-[hsl(var(--gold-primary))] data-[state=active]:text-[hsl(var(--dark-primary))]">
            <Shield className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-[hsl(var(--gold-primary))] data-[state=active]:text-[hsl(var(--dark-primary))]">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-[hsl(var(--gold-primary))] data-[state=active]:text-[hsl(var(--dark-primary))]">
            <Palette className="h-4 w-4 mr-2" />
            Aparência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
              <CardHeader>
                <CardTitle className="flex items-center text-[hsl(var(--gold-primary))]">
                  <Globe className="h-5 w-5 mr-2" />
                  Configurações da Plataforma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[hsl(var(--dark-text))]">Nome da Plataforma</label>
                  <Input 
                    defaultValue="Privé Platform" 
                    className="bg-[hsl(var(--dark-primary))] border-[hsl(var(--gold-accent))]/20 text-[hsl(var(--dark-text))]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[hsl(var(--dark-text))]">URL da Plataforma</label>
                  <Input 
                    defaultValue="https://prive-platform.com" 
                    className="bg-[hsl(var(--dark-primary))] border-[hsl(var(--gold-accent))]/20 text-[hsl(var(--dark-text))]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[hsl(var(--dark-text))]">Email de Contato</label>
                  <Input 
                    defaultValue="contato@prive-platform.com" 
                    className="bg-[hsl(var(--dark-primary))] border-[hsl(var(--gold-accent))]/20 text-[hsl(var(--dark-text))]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
              <CardHeader>
                <CardTitle className="flex items-center text-[hsl(var(--gold-primary))]">
                  <Users className="h-5 w-5 mr-2" />
                  Configurações de Usuário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-[hsl(var(--dark-text))]">Registro de Novos Usuários</div>
                    <div className="text-xs text-[hsl(var(--dark-muted))]">Permitir que novos usuários se registrem</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-[hsl(var(--dark-text))]">Aprovação Manual</div>
                    <div className="text-xs text-[hsl(var(--dark-muted))]">Aprovar modelos manualmente</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-[hsl(var(--dark-text))]">Verificação de Email</div>
                    <div className="text-xs text-[hsl(var(--dark-muted))]">Exigir verificação de email</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
              <CardHeader>
                <CardTitle className="flex items-center text-[hsl(var(--gold-primary))]">
                  <Shield className="h-5 w-5 mr-2" />
                  Configurações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-[hsl(var(--dark-text))]">Autenticação em Duas Etapas</div>
                    <div className="text-xs text-[hsl(var(--dark-muted))]">Exigir 2FA para administradores</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-[hsl(var(--dark-text))]">Log de Atividades</div>
                    <div className="text-xs text-[hsl(var(--dark-muted))]">Registrar todas as atividades</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[hsl(var(--dark-text))]">Tempo de Sessão (minutos)</label>
                  <Input 
                    type="number"
                    defaultValue="120" 
                    className="bg-[hsl(var(--dark-primary))] border-[hsl(var(--gold-accent))]/20 text-[hsl(var(--dark-text))]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
              <CardHeader>
                <CardTitle className="flex items-center text-[hsl(var(--gold-primary))]">
                  <Database className="h-5 w-5 mr-2" />
                  Backup e Manutenção
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-[hsl(var(--dark-text))]">Backup Automático</div>
                    <div className="text-xs text-[hsl(var(--dark-muted))]">Backup diário dos dados</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[hsl(var(--dark-text))]">Retenção de Backup (dias)</label>
                  <Input 
                    type="number"
                    defaultValue="30" 
                    className="bg-[hsl(var(--dark-primary))] border-[hsl(var(--gold-accent))]/20 text-[hsl(var(--dark-text))]"
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))] hover:from-[hsl(var(--gold-primary))]/90 hover:to-[hsl(var(--gold-accent))]/90 text-[hsl(var(--dark-primary))]">
                  Executar Backup Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
            <CardHeader>
              <CardTitle className="flex items-center text-[hsl(var(--gold-primary))]">
                <Mail className="h-5 w-5 mr-2" />
                Configurações de Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[hsl(var(--dark-text))]">Servidor SMTP</label>
                  <Input 
                    defaultValue="smtp.gmail.com" 
                    className="bg-[hsl(var(--dark-primary))] border-[hsl(var(--gold-accent))]/20 text-[hsl(var(--dark-text))]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[hsl(var(--dark-text))]">Porta</label>
                  <Input 
                    defaultValue="587" 
                    className="bg-[hsl(var(--dark-primary))] border-[hsl(var(--gold-accent))]/20 text-[hsl(var(--dark-text))]"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[hsl(var(--gold-accent))]/20">
                <h4 className="text-sm font-medium text-[hsl(var(--gold-primary))]">Notificações Automáticas</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm text-[hsl(var(--dark-text))]">Novo Registro de Modelo</div>
                      <div className="text-xs text-[hsl(var(--dark-muted))]">Notificar quando um novo modelo se registrar</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm text-[hsl(var(--dark-text))]">Agendamentos</div>
                      <div className="text-xs text-[hsl(var(--dark-muted))]">Notificar sobre novos agendamentos</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm text-[hsl(var(--dark-text))]">Avaliações</div>
                      <div className="text-xs text-[hsl(var(--dark-muted))]">Notificar sobre novas avaliações</div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
            <CardHeader>
              <CardTitle className="flex items-center text-[hsl(var(--gold-primary))]">
                <Palette className="h-5 w-5 mr-2" />
                Personalização da Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-[hsl(var(--gold-primary))]">Cores da Marca</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm text-[hsl(var(--dark-text))]">Cor Primária</label>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--gold-primary))] border border-[hsl(var(--gold-accent))]/20"></div>
                        <Input 
                          defaultValue="#D4AF37" 
                          className="bg-[hsl(var(--dark-primary))] border-[hsl(var(--gold-accent))]/20 text-[hsl(var(--dark-text))]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[hsl(var(--dark-text))]">Cor Secundária</label>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--gold-accent))] border border-[hsl(var(--gold-accent))]/20"></div>
                        <Input 
                          defaultValue="#FFD700" 
                          className="bg-[hsl(var(--dark-primary))] border-[hsl(var(--gold-accent))]/20 text-[hsl(var(--dark-text))]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-[hsl(var(--gold-primary))]">Configurações de Tema</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm text-[hsl(var(--dark-text))]">Modo Escuro</div>
                        <div className="text-xs text-[hsl(var(--dark-muted))]">Usar tema escuro por padrão</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm text-[hsl(var(--dark-text))]">Animações</div>
                        <div className="text-xs text-[hsl(var(--dark-muted))]">Habilitar animações na interface</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[hsl(var(--dark-text))]">Logo da Plataforma</label>
                      <Input 
                        type="file"
                        accept="image/*"
                        className="bg-[hsl(var(--dark-primary))] border-[hsl(var(--gold-accent))]/20 text-[hsl(var(--dark-text))]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-[hsl(var(--gold-accent))]/20">
        <Button className="bg-gradient-to-r from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))] hover:from-[hsl(var(--gold-primary))]/90 hover:to-[hsl(var(--gold-accent))]/90 text-[hsl(var(--dark-primary))]">
          Salvar Configurações
        </Button>
      </div>
    </DesignTestLayout>
  );
};

export default AdminDesignTestSettings;