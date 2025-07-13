import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Code, FileText, Users, MessageSquare, Star, Settings, ArrowLeft, Eye, Calendar, Upload, Bell, Route } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ComponentInfo {
  name: string;
  path: string;
  category: 'ui' | 'admin' | 'model' | 'chat' | 'reviews' | 'core';
  description: string;
  usedIn: string[];
  routes: string[];
  status: 'active' | 'deprecated' | 'unused';
  preview?: React.ReactNode;
}

// Component Preview Components
const ComponentPreview = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border rounded-lg bg-card/50 flex items-center justify-center min-h-[120px]">
    {children}
  </div>
);

const componentsData: ComponentInfo[] = [
  // UI Components
  { 
    name: 'Button', 
    path: 'src/components/ui/button.tsx', 
    category: 'ui', 
    description: 'Base button component with multiple variants', 
    usedIn: ['V2Header', 'ModelCard', 'AdminAppointmentForm'], 
    routes: ['/v2/dashboard', '/v2/profile', '/v2/appointments', '/admin', '/'],
    status: 'active',
    preview: (
      <ComponentPreview>
        <div className="space-x-2">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
        </div>
      </ComponentPreview>
    )
  },
  { 
    name: 'Card', 
    path: 'src/components/ui/card.tsx', 
    category: 'ui', 
    description: 'Container component for structured content', 
    usedIn: ['UserPlanInfo', 'AdminAppointmentDetails', 'ModelCard'], 
    routes: ['/profile', '/admin', '/', '/v2/dashboard'],
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-64">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Card content goes here</p>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'Input', 
    path: 'src/components/ui/input.tsx', 
    category: 'ui', 
    description: 'Text input field component', 
    usedIn: ['V2Header', 'UserProfile', 'AdminAppointmentForm'], 
    routes: ['/v2/dashboard', '/profile', '/admin', '/v2/appointments'],
    status: 'active',
    preview: (
      <ComponentPreview>
        <div className="space-y-2 w-64">
          <Input placeholder="Digite algo..." />
          <Input type="email" placeholder="email@exemplo.com" />
        </div>
      </ComponentPreview>
    )
  },
  { 
    name: 'Dialog', 
    path: 'src/components/ui/dialog.tsx', 
    category: 'ui', 
    description: 'Modal dialog component', 
    usedIn: ['V2Header', 'ProfilePhotoUpload'], 
    routes: ['/v2/dashboard', '/profile', '/v2/appointments'],
    status: 'active',
    preview: (
      <ComponentPreview>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Abrir Modal</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Título do Modal</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">Conteúdo do modal aqui.</p>
            </div>
          </DialogContent>
        </Dialog>
      </ComponentPreview>
    )
  },
  { 
    name: 'Avatar', 
    path: 'src/components/ui/avatar.tsx', 
    category: 'ui', 
    description: 'User avatar display component', 
    usedIn: ['V2Header', 'Header', 'ProfilePhotoUpload'], 
    routes: ['/v2/dashboard', '/', '/profile'],
    status: 'active',
    preview: (
      <ComponentPreview>
        <div className="flex space-x-3">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
        </div>
      </ComponentPreview>
    )
  },
  
  // Admin Components
  { 
    name: 'AdminAppointmentForm', 
    path: 'src/components/admin/AdminAppointmentForm.tsx', 
    category: 'admin', 
    description: 'Form for creating/editing appointments', 
    usedIn: ['AppointmentsManager'], 
    routes: ['/admin', '/admin-design-test/appointments'],
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Novo Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Data</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Selecionar data</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Input placeholder="Nome do cliente" />
            </div>
            <Button className="w-full">Criar Agendamento</Button>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  
  // Chat Components
  { 
    name: 'ChatInterface', 
    path: 'src/components/chat/ChatInterface.tsx', 
    category: 'chat', 
    description: 'Main chat interface component', 
    usedIn: ['ChatPage', 'ModelV2ChatPage'], 
    routes: ['/chat', '/v2/chat', '/mobile-chat'],
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80 h-64">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Chat Interface</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="bg-muted p-2 rounded-lg text-sm">Olá! Como posso ajudar?</div>
              <div className="bg-primary p-2 rounded-lg text-sm text-primary-foreground ml-8">Preciso de informações</div>
            </div>
            <div className="flex items-center space-x-2">
              <Input placeholder="Digite sua mensagem..." className="text-xs" />
              <Button size="sm">Enviar</Button>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  
  // Core Components
  { 
    name: 'ModelCard', 
    path: 'src/components/ModelCard.tsx', 
    category: 'core', 
    description: 'Card component for displaying model information', 
    usedIn: ['HomePage', 'SearchPage'], 
    routes: ['/', '/buscar', '/cidade/:cityId', '/categoria/:categoryId'],
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-64">
          <div className="aspect-[3/4] bg-muted rounded-t-lg flex items-center justify-center">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardContent className="p-3">
            <h3 className="font-medium">Nome do Modelo</h3>
            <p className="text-sm text-muted-foreground">25 anos • São Paulo</p>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="text-xs">Disponível</Badge>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  
  // Admin Components com Preview
  { 
    name: 'AdminAppointmentDetails', 
    path: 'src/components/admin/AdminAppointmentDetails.tsx', 
    category: 'admin', 
    description: 'Detailed view of appointment information', 
    usedIn: ['AppointmentsManager'], 
    routes: ['/admin'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Detalhes do Agendamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cliente:</span>
              <span>Maria Silva</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Data:</span>
              <span>15/12/2024</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="secondary">Confirmado</Badge>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'AppointmentsManager', 
    path: 'src/components/admin/AppointmentsManager.tsx', 
    category: 'admin', 
    description: 'Main interface for managing appointments', 
    usedIn: ['AdminDesignTestAppointments'], 
    routes: ['/admin'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Gerenciar Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total: 12</span>
              <Button size="sm">Novo</Button>
            </div>
            <div className="space-y-1">
              <div className="p-2 border rounded text-xs">João - 14:00</div>
              <div className="p-2 border rounded text-xs">Ana - 16:30</div>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'CategoriesManager', 
    path: 'src/components/admin/CategoriesManager.tsx', 
    category: 'admin', 
    description: 'Interface for managing model categories', 
    usedIn: ['AdminDesignTestFields'], 
    routes: ['/admin'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Gerenciar Categorias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Input placeholder="Nova categoria" className="text-xs" />
              <Button size="sm">Adicionar</Button>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center p-2 border rounded">
                <span className="text-xs">Premium</span>
                <Button variant="ghost" size="sm">×</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'CategoryForm', 
    path: 'src/components/admin/CategoryForm.tsx', 
    category: 'admin', 
    description: 'Form for creating/editing categories', 
    usedIn: ['CategoriesManager'], 
    routes: ['/admin'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-64">
          <CardHeader>
            <CardTitle className="text-sm">Nova Categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Nome</Label>
              <Input placeholder="Nome da categoria" className="text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Descrição</Label>
              <Textarea placeholder="Descrição..." className="text-xs h-16" />
            </div>
            <Button size="sm" className="w-full">Salvar</Button>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'ChatManager', 
    path: 'src/components/admin/ChatManager.tsx', 
    category: 'admin', 
    description: 'Admin interface for chat management', 
    usedIn: ['AdminDesignTestChat'], 
    routes: ['/admin'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Configurações do Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs">Chat ativo</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Upload de arquivos</span>
              <Checkbox />
            </div>
            <Button size="sm" className="w-full">Salvar configurações</Button>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'ChatSettings', 
    path: 'src/components/admin/ChatSettings.tsx', 
    category: 'admin', 
    description: 'Configuration settings for chat functionality', 
    usedIn: ['ChatManager'], 
    routes: ['/admin'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-64">
          <CardHeader>
            <CardTitle className="text-sm">Configurações Avançadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Tamanho máximo (MB)</Label>
              <Input type="number" placeholder="10" className="text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tipos permitidos</Label>
              <Input placeholder="jpg, png, pdf" className="text-xs" />
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'CitiesManager', 
    path: 'src/components/admin/CitiesManager.tsx', 
    category: 'admin', 
    description: 'Interface for managing cities', 
    usedIn: ['AdminDesignTestFields'], 
    routes: ['/admin'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Gerenciar Cidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Cidade" className="text-xs" />
              <Input placeholder="Estado" className="text-xs" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center p-2 border rounded">
                <span className="text-xs">São Paulo - SP</span>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'ClientForm', 
    path: 'src/components/admin/ClientForm.tsx', 
    category: 'admin', 
    description: 'Form for creating/editing client information', 
    usedIn: ['V2Header'], 
    routes: ['/v2/dashboard'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Cadastro de Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Nome completo" className="text-xs" />
            <Input type="email" placeholder="E-mail" className="text-xs" />
            <Input type="tel" placeholder="Telefone" className="text-xs" />
            <Textarea placeholder="Observações..." className="text-xs h-16" />
            <Button size="sm" className="w-full">Cadastrar Cliente</Button>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'CustomFieldsManager', 
    path: 'src/components/admin/CustomFieldsManager.tsx', 
    category: 'admin', 
    description: 'Interface for managing custom model fields', 
    usedIn: ['AdminDesignTestFields'], 
    routes: ['/admin'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Campos Personalizados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button size="sm" className="w-full">+ Novo Campo</Button>
            <div className="space-y-1">
              <div className="p-2 border rounded flex justify-between items-center">
                <span className="text-xs">Altura</span>
                <Badge variant="outline" className="text-xs">Número</Badge>
              </div>
              <div className="p-2 border rounded flex justify-between items-center">
                <span className="text-xs">Idiomas</span>
                <Badge variant="outline" className="text-xs">Texto</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'ModelForm', 
    path: 'src/components/admin/ModelForm.tsx', 
    category: 'admin', 
    description: 'Comprehensive form for model registration/editing', 
    usedIn: ['ModelsListContainer'], 
    routes: ['/admin'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Cadastro de Modelo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Nome" className="text-xs" />
              <Input type="number" placeholder="Idade" className="text-xs" />
            </div>
            <Input placeholder="Cidade" className="text-xs" />
            <Textarea placeholder="Descrição..." className="text-xs h-16" />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">Salvar</Button>
              <Button variant="outline" size="sm">Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'ModelsList', 
    path: 'src/components/admin/ModelsList.tsx', 
    category: 'admin', 
    description: 'List view of all models with management actions', 
    usedIn: ['ModelsListContainer'], 
    routes: ['/admin'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Lista de Modelos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Input placeholder="Buscar..." className="text-xs flex-1" />
              <Button size="sm">Filtrar</Button>
            </div>
            <div className="space-y-1">
              <div className="p-2 border rounded flex justify-between items-center">
                <div>
                  <div className="text-xs font-medium">Ana Silva</div>
                  <div className="text-xs text-muted-foreground">25 anos</div>
                </div>
                <Badge variant="secondary" className="text-xs">Ativo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'ReviewsManager', 
    path: 'src/components/admin/ReviewsManager.tsx', 
    category: 'admin', 
    description: 'Interface for managing user reviews', 
    usedIn: ['AdminDesignTestSettings'], 
    routes: ['/admin'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4" />
              Gerenciar Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <div className="p-2 border rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium">João Santos</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Excelente atendimento...</p>
                <div className="flex gap-1 mt-2">
                  <Button size="sm" className="text-xs">Aprovar</Button>
                  <Button variant="outline" size="sm" className="text-xs">Rejeitar</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'ServiceForm', 
    path: 'src/components/admin/ServiceForm.tsx', 
    category: 'admin', 
    description: 'Form for creating/editing services', 
    usedIn: ['V2Header'], 
    routes: ['/v2/dashboard'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-64">
          <CardHeader>
            <CardTitle className="text-sm">Novo Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Nome do serviço" className="text-xs" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Preço" className="text-xs" />
              <Input placeholder="Duração (min)" className="text-xs" />
            </div>
            <Textarea placeholder="Descrição..." className="text-xs h-16" />
            <Button size="sm" className="w-full">Criar Serviço</Button>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  
  // Model Components com Preview
  { 
    name: 'ModelAppointmentForm', 
    path: 'src/components/model/ModelAppointmentForm.tsx', 
    category: 'model', 
    description: 'Appointment creation form for models', 
    usedIn: ['V2Header', 'ModelV2AppointmentsPage'], 
    routes: ['/v2/appointments'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Agendar Horário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Data</Label>
                <Input type="date" className="text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Horário</Label>
                <Input type="time" className="text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Serviço</Label>
              <Input placeholder="Selecionar serviço" className="text-xs" />
            </div>
            <Button size="sm" className="w-full">Confirmar Agendamento</Button>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'ModelAppointmentsList', 
    path: 'src/components/model/ModelAppointmentsList.tsx', 
    category: 'model', 
    description: 'List of model appointments with management options', 
    usedIn: ['ModelV2AppointmentsPage'], 
    routes: ['/v2/appointments'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Próximos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <div className="p-2 border rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs font-medium">Carlos Silva</div>
                    <div className="text-xs text-muted-foreground">Hoje - 14:00</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">Confirmado</Badge>
                </div>
              </div>
              <div className="p-2 border rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs font-medium">Maria Santos</div>
                    <div className="text-xs text-muted-foreground">Amanhã - 16:30</div>
                  </div>
                  <Badge variant="outline" className="text-xs">Pendente</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'ModelDashboardHome', 
    path: 'src/components/model/ModelDashboardHome.tsx', 
    category: 'model', 
    description: 'Main dashboard view for models', 
    usedIn: ['ModelV2DashboardPage'], 
    routes: ['/v2/dashboard'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <div className="grid grid-cols-2 gap-2 w-80">
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Agendamentos</div>
            <div className="text-lg font-bold">12</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Visualizações</div>
            <div className="text-lg font-bold">1.2k</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Avaliações</div>
            <div className="text-lg font-bold">4.8⭐</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Faturamento</div>
            <div className="text-lg font-bold">R$ 2.5k</div>
          </Card>
        </div>
      </ComponentPreview>
    )
  },
  { 
    name: 'ModelMediaManager', 
    path: 'src/components/model/ModelMediaManager.tsx', 
    category: 'model', 
    description: 'Media management interface for models', 
    usedIn: ['ModelV2MediaPage'], 
    routes: ['/v2/media'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Gerenciar Mídia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button size="sm" className="w-full">+ Upload de Fotos</Button>
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-square bg-muted rounded border"></div>
              <div className="aspect-square bg-muted rounded border"></div>
              <div className="aspect-square bg-muted rounded border"></div>
            </div>
            <div className="text-xs text-muted-foreground text-center">3 de 20 fotos</div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'ModelProfileManager', 
    path: 'src/components/model/ModelProfileManager.tsx', 
    category: 'model', 
    description: 'Profile editing interface for models', 
    usedIn: ['ModelV2ProfilePage'], 
    routes: ['/v2/profile'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Editar Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
              <Button size="sm" variant="outline">Trocar Foto</Button>
            </div>
            <Input placeholder="Nome" className="text-xs" />
            <Textarea placeholder="Sobre mim..." className="text-xs h-16" />
            <Button size="sm" className="w-full">Salvar Alterações</Button>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'ModelStats', 
    path: 'src/components/model/ModelStats.tsx', 
    category: 'model', 
    description: 'Statistics display for model performance', 
    usedIn: ['ModelDashboardHome'], 
    routes: ['/v2/dashboard'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Estatísticas do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Visualizações hoje:</span>
              <span className="font-medium">45</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Perfil completo:</span>
              <span className="font-medium">85%</span>
            </div>
            <div className="w-full bg-muted h-2 rounded">
              <div className="bg-primary h-2 rounded w-4/5"></div>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'OrganizedMediaManager', 
    path: 'src/components/model/OrganizedMediaManager.tsx', 
    category: 'model', 
    description: 'Organized view of model media content', 
    usedIn: ['V2Header'], 
    routes: ['/v2/media'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Organizar Mídia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Tabs defaultValue="fotos" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fotos" className="text-xs">Fotos</TabsTrigger>
                <TabsTrigger value="videos" className="text-xs">Vídeos</TabsTrigger>
              </TabsList>
              <TabsContent value="fotos" className="space-y-1">
                <div className="grid grid-cols-3 gap-1">
                  <div className="aspect-square bg-muted rounded"></div>
                  <div className="aspect-square bg-muted rounded"></div>
                  <div className="aspect-square bg-muted rounded"></div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  
  // Chat Components com Preview
  { 
    name: 'ConversationsList', 
    path: 'src/components/chat/ConversationsList.tsx', 
    category: 'chat', 
    description: 'List of user conversations', 
    usedIn: ['ChatInterface'], 
    routes: ['/chat', '/v2/chat'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-64">
          <CardHeader>
            <CardTitle className="text-sm">Conversas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="p-2 border rounded flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">JS</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-xs font-medium">João Silva</div>
                <div className="text-xs text-muted-foreground">Última mensagem...</div>
              </div>
            </div>
            <div className="p-2 border rounded flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">MS</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-xs font-medium">Maria Santos</div>
                <div className="text-xs text-muted-foreground">Olá, tudo bem?</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'MessageItem', 
    path: 'src/components/chat/MessageItem.tsx', 
    category: 'chat', 
    description: 'Individual message display component', 
    usedIn: ['ChatInterface'], 
    routes: ['/chat', '/v2/chat'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <div className="w-64 space-y-2">
          <div className="flex gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">JS</AvatarFallback>
            </Avatar>
            <div className="bg-muted p-2 rounded-lg text-xs max-w-48">
              Olá! Como você está?
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg text-xs max-w-48">
              Estou bem, obrigada!
            </div>
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">EU</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </ComponentPreview>
    )
  },
  { 
    name: 'MediaUpload', 
    path: 'src/components/chat/MediaUpload.tsx', 
    category: 'chat', 
    description: 'Media upload component for chat', 
    usedIn: ['ChatInterface'], 
    routes: ['/chat', '/v2/chat'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-64">
          <CardContent className="p-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                Arraste arquivos ou clique para enviar
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" className="flex-1">Foto</Button>
              <Button size="sm" variant="outline" className="flex-1">Arquivo</Button>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'ContactInfoSheet', 
    path: 'src/components/chat/ContactInfoSheet.tsx', 
    category: 'chat', 
    description: 'Contact information side panel', 
    usedIn: ['ChatInterface'], 
    routes: ['/chat', '/v2/chat'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-64">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm">João Silva</CardTitle>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Informações</Label>
              <div className="text-xs text-muted-foreground">
                Membro desde janeiro 2024
              </div>
            </div>
            <Separator />
            <div className="space-y-1">
              <Button variant="outline" size="sm" className="w-full">
                <Bell className="h-3 w-3 mr-1" />
                Silenciar
              </Button>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  
  // Core Components com Preview
  { 
    name: 'Header', 
    path: 'src/components/Header.tsx', 
    category: 'core', 
    description: 'Main application header with navigation', 
    usedIn: ['App'], 
    routes: ['/', '/profile', '/buscar'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold">Logo</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">Home</Button>
                <Button variant="ghost" size="sm">Buscar</Button>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">U</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'V2Header', 
    path: 'src/components/V2Header.tsx', 
    category: 'core', 
    description: 'Enhanced header for V2 interface', 
    usedIn: ['ModelV2Pages'], 
    routes: ['/v2/dashboard', '/v2/feed', '/v2/chat', '/v2/profile'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold">Dashboard V2</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">Feed</Button>
                <Button variant="ghost" size="sm">Chat</Button>
                <Button variant="ghost" size="sm">Perfil</Button>
                <Bell className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'AuthRedirectHandler', 
    path: 'src/components/AuthRedirectHandler.tsx', 
    category: 'core', 
    description: 'Handles authentication redirects', 
    usedIn: ['App'], 
    routes: ['/*'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-64">
          <CardContent className="p-4 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <div className="text-xs text-muted-foreground">
              Verificando autenticação...
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'ModelProfile', 
    path: 'src/components/ModelProfile.tsx', 
    category: 'core', 
    description: 'Full model profile display', 
    usedIn: ['ModelPage'], 
    routes: ['/modelo/:id'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <div className="aspect-[4/3] bg-muted flex items-center justify-center">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">Ana Silva</h3>
                <p className="text-sm text-muted-foreground">25 anos • São Paulo</p>
              </div>
              <Badge variant="secondary">Online</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Descrição do perfil aqui...
            </p>
            <Button size="sm" className="w-full">Enviar Mensagem</Button>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'ProfilePhotoUpload', 
    path: 'src/components/ProfilePhotoUpload.tsx', 
    category: 'core', 
    description: 'Component for uploading profile photos', 
    usedIn: ['UserProfile'], 
    routes: ['/profile'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-64">
          <CardContent className="p-4 text-center">
            <Avatar className="h-20 w-20 mx-auto mb-3">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Button size="sm" variant="outline" className="mb-2">
              <Upload className="h-3 w-3 mr-1" />
              Trocar Foto
            </Button>
            <div className="text-xs text-muted-foreground">
              JPG ou PNG, máx. 5MB
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'UserProfile', 
    path: 'src/components/UserProfile.tsx', 
    category: 'core', 
    description: 'User profile management interface', 
    usedIn: ['Profile'], 
    routes: ['/profile'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Meu Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium">João Silva</div>
                <div className="text-xs text-muted-foreground">joao@email.com</div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Editar Informações
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Alterar Senha
              </Button>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'UserPlanInfo', 
    path: 'src/components/UserPlanInfo.tsx', 
    category: 'core', 
    description: 'Display user plan information', 
    usedIn: ['UserProfile'], 
    routes: ['/profile'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Plano Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium">Plano Premium</div>
                <div className="text-xs text-muted-foreground">Renovação automática</div>
              </div>
              <Badge variant="secondary">Ativo</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Próxima cobrança: 15/01/2025
            </div>
            <Button size="sm" variant="outline" className="w-full">
              Gerenciar Plano
            </Button>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  
  // Reviews Components com Preview
  { 
    name: 'ReviewForm', 
    path: 'src/components/reviews/ReviewForm.tsx', 
    category: 'reviews', 
    description: 'Form for creating user reviews', 
    usedIn: ['ReviewsPage'], 
    routes: ['/avaliacoes', '/v2/reviews'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Nova Avaliação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Avaliação</Label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="h-5 w-5 cursor-pointer hover:fill-current" />
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Comentário</Label>
              <Textarea placeholder="Compartilhe sua experiência..." className="text-xs h-20" />
            </div>
            <Button size="sm" className="w-full">Enviar Avaliação</Button>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'PendingReviewsPanel', 
    path: 'src/components/reviews/PendingReviewsPanel.tsx', 
    category: 'reviews', 
    description: 'Panel showing pending reviews', 
    usedIn: ['ReviewsPage'], 
    routes: ['/avaliacoes', '/v2/reviews'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm">Avaliações Pendentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 border rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium">Ana Silva</span>
                <span className="text-xs text-muted-foreground">2 dias atrás</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Agendamento realizado em 10/12/2024
              </p>
              <Button size="sm" className="w-full">Avaliar Agora</Button>
            </div>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
  { 
    name: 'PriveTrustPanel', 
    path: 'src/components/reviews/PriveTrustPanel.tsx', 
    category: 'reviews', 
    description: 'Panel for PriveTrust status display', 
    usedIn: ['ReviewsPage'], 
    routes: ['/avaliacoes', '/v2/reviews'], 
    status: 'active',
    preview: (
      <ComponentPreview>
        <Card className="w-80">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4" />
              PriveTrust Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs">Status atual:</span>
              <Badge variant="secondary">Verificado</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Progresso:</div>
              <div className="w-full bg-muted h-2 rounded">
                <div className="bg-primary h-2 rounded w-4/5"></div>
              </div>
              <div className="text-xs text-muted-foreground">8 de 10 avaliações</div>
            </div>
            <Button size="sm" variant="outline" className="w-full">
              Ver Detalhes
            </Button>
          </CardContent>
        </Card>
      </ComponentPreview>
    )
  },
];

const categoryIcons = {
  ui: <Code className="h-4 w-4" />,
  admin: <Settings className="h-4 w-4" />,
  model: <Users className="h-4 w-4" />,
  chat: <MessageSquare className="h-4 w-4" />,
  reviews: <Star className="h-4 w-4" />,
  core: <FileText className="h-4 w-4" />,
};

const categoryLabels = {
  ui: 'UI Components',
  admin: 'Admin Components', 
  model: 'Model Components',
  chat: 'Chat Components',
  reviews: 'Reviews Components',
  core: 'Core Components',
};

const statusColors = {
  active: 'bg-green-500/10 text-green-700 border-green-200',
  deprecated: 'bg-orange-500/10 text-orange-700 border-orange-200',
  unused: 'bg-gray-500/10 text-gray-700 border-gray-200',
};

const ComponentsDocumentationPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<string>('all');

  const filteredComponents = useMemo(() => {
    return componentsData.filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.routes.some(route => route.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           component.usedIn.some(usage => usage.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || component.status === selectedStatus;
      const matchesRoute = selectedRoute === 'all' || component.routes.includes(selectedRoute);
      
      return matchesSearch && matchesCategory && matchesStatus && matchesRoute;
    });
  }, [searchTerm, selectedCategory, selectedStatus, selectedRoute]);

  const componentsByCategory = useMemo(() => {
    const grouped = filteredComponents.reduce((acc, component) => {
      if (!acc[component.category]) {
        acc[component.category] = [];
      }
      acc[component.category].push(component);
      return acc;
    }, {} as Record<string, ComponentInfo[]>);
    
    return grouped;
  }, [filteredComponents]);

  const statistics = useMemo(() => {
    const total = componentsData.length;
    const active = componentsData.filter(c => c.status === 'active').length;
    const unused = componentsData.filter(c => c.status === 'unused').length;
    const mostUsed = componentsData.reduce((prev, current) => 
      current.usedIn.length > prev.usedIn.length ? current : prev
    );
    const uniqueRoutes = [...new Set(componentsData.flatMap(c => c.routes))];
    
    return { total, active, unused, mostUsed, totalRoutes: uniqueRoutes.length };
  }, []);

  const allRoutes = useMemo(() => {
    const routes = [...new Set(componentsData.flatMap(c => c.routes))];
    return routes.sort();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Documentação de Componentes</h1>
              <p className="text-muted-foreground">Visualize todos os componentes do projeto e onde são utilizados</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{statistics.total}</div>
                <div className="text-sm text-muted-foreground">Total de Componentes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{statistics.active}</div>
                <div className="text-sm text-muted-foreground">Componentes Ativos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{statistics.totalRoutes}</div>
                <div className="text-sm text-muted-foreground">Rotas Cobertas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium">{statistics.mostUsed.name}</div>
                <div className="text-sm text-muted-foreground">Mais Utilizado ({statistics.mostUsed.usedIn.length} usos)</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar componentes, rotas ou descrições..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                  <SelectItem value="unused">Não Utilizado</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Rota" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Rotas</SelectItem>
                  {allRoutes.map((route) => (
                    <SelectItem key={route} value={route}>{route}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="by-category" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="by-category">Por Categoria</TabsTrigger>
            <TabsTrigger value="list-view">Lista Completa</TabsTrigger>
          </TabsList>

          <TabsContent value="by-category" className="space-y-6">
            <div className="text-sm text-muted-foreground mb-4">
              Mostrando {filteredComponents.length} de {componentsData.length} componentes
              {selectedRoute !== 'all' && ` na rota "${selectedRoute}"`}
            </div>
            
            {Object.entries(componentsByCategory).map(([category, components]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {categoryIcons[category as keyof typeof categoryIcons]}
                    {categoryLabels[category as keyof typeof categoryLabels]}
                    <Badge variant="secondary">{components.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {components.map((component) => (
                      <Card key={component.name} className="h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{component.name}</CardTitle>
                            <Badge className={statusColors[component.status]}>
                              {component.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {component.path}
                          </p>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm mb-3">{component.description}</p>
                          
                          {/* Preview Section */}
                          {component.preview && (
                            <div className="mb-4">
                              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Preview:
                              </div>
                              {component.preview}
                            </div>
                          )}
                          
                          <div>
                            <div className="text-sm font-medium mb-2">Usado em:</div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {component.usedIn.length > 0 ? (
                                component.usedIn.map((usage) => (
                                  <Badge key={usage} variant="outline" className="text-xs">
                                    {usage}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="outline" className="text-xs text-muted-foreground">
                                  Não utilizado
                                </Badge>
                              )}
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Route className="h-4 w-4" />
                                Rotas:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {component.routes.length > 0 ? (
                                  component.routes.map((route) => (
                                    <Badge key={route} variant="secondary" className="text-xs">
                                      {route}
                                    </Badge>
                                  ))
                                ) : (
                                  <Badge variant="outline" className="text-xs text-muted-foreground">
                                    Nenhuma rota
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="list-view">
            <Card>
              <CardContent className="p-0">
                <div className="space-y-4 p-6">
                  {filteredComponents.map((component) => (
                    <div key={component.name} className="border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {categoryIcons[component.category]}
                            <h3 className="font-medium">{component.name}</h3>
                            <Badge className={statusColors[component.status]}>
                              {component.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{component.description}</p>
                          <p className="text-xs text-muted-foreground">{component.path}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium mb-1">
                            {component.usedIn.length} uso(s) • {component.routes.length} rota(s)
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1 justify-end max-w-64">
                              {component.usedIn.slice(0, 2).map((usage) => (
                                <Badge key={usage} variant="outline" className="text-xs">
                                  {usage}
                                </Badge>
                              ))}
                              {component.usedIn.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{component.usedIn.length - 2} mais
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 justify-end max-w-64">
                              {component.routes.slice(0, 2).map((route) => (
                                <Badge key={route} variant="secondary" className="text-xs">
                                  {route}
                                </Badge>
                              ))}
                              {component.routes.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{component.routes.length - 2} rotas
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Preview Section */}
                      {component.preview && (
                        <div className="border-t bg-muted/20 p-4">
                          <div className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Preview Visual:
                          </div>
                          <div className="bg-background rounded-lg p-3">
                            {component.preview}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComponentsDocumentationPage;