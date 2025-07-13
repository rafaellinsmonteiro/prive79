import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Code, FileText, Users, MessageSquare, Star, Settings, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ComponentInfo {
  name: string;
  path: string;
  category: 'ui' | 'admin' | 'model' | 'chat' | 'reviews' | 'core';
  description: string;
  usedIn: string[];
  status: 'active' | 'deprecated' | 'unused';
}

const componentsData: ComponentInfo[] = [
  // UI Components
  { name: 'Button', path: 'src/components/ui/button.tsx', category: 'ui', description: 'Base button component with multiple variants', usedIn: ['V2Header', 'ModelCard', 'AdminAppointmentForm'], status: 'active' },
  { name: 'Card', path: 'src/components/ui/card.tsx', category: 'ui', description: 'Container component for structured content', usedIn: ['UserPlanInfo', 'AdminAppointmentDetails', 'ModelCard'], status: 'active' },
  { name: 'Input', path: 'src/components/ui/input.tsx', category: 'ui', description: 'Text input field component', usedIn: ['V2Header', 'UserProfile', 'AdminAppointmentForm'], status: 'active' },
  { name: 'Dialog', path: 'src/components/ui/dialog.tsx', category: 'ui', description: 'Modal dialog component', usedIn: ['V2Header', 'ProfilePhotoUpload'], status: 'active' },
  { name: 'Avatar', path: 'src/components/ui/avatar.tsx', category: 'ui', description: 'User avatar display component', usedIn: ['V2Header', 'Header', 'ProfilePhotoUpload'], status: 'active' },
  
  // Admin Components
  { name: 'AdminAppointmentForm', path: 'src/components/admin/AdminAppointmentForm.tsx', category: 'admin', description: 'Form for creating/editing appointments', usedIn: ['AppointmentsManager'], status: 'active' },
  { name: 'AdminAppointmentDetails', path: 'src/components/admin/AdminAppointmentDetails.tsx', category: 'admin', description: 'Detailed view of appointment information', usedIn: ['AppointmentsManager'], status: 'active' },
  { name: 'AppointmentsManager', path: 'src/components/admin/AppointmentsManager.tsx', category: 'admin', description: 'Main interface for managing appointments', usedIn: ['AdminDesignTestAppointments'], status: 'active' },
  { name: 'CategoriesManager', path: 'src/components/admin/CategoriesManager.tsx', category: 'admin', description: 'Interface for managing model categories', usedIn: ['AdminDesignTestFields'], status: 'active' },
  { name: 'CategoryForm', path: 'src/components/admin/CategoryForm.tsx', category: 'admin', description: 'Form for creating/editing categories', usedIn: ['CategoriesManager'], status: 'active' },
  { name: 'ChatManager', path: 'src/components/admin/ChatManager.tsx', category: 'admin', description: 'Admin interface for chat management', usedIn: ['AdminDesignTestChat'], status: 'active' },
  { name: 'ChatSettings', path: 'src/components/admin/ChatSettings.tsx', category: 'admin', description: 'Configuration settings for chat functionality', usedIn: ['ChatManager'], status: 'active' },
  { name: 'CitiesManager', path: 'src/components/admin/CitiesManager.tsx', category: 'admin', description: 'Interface for managing cities', usedIn: ['AdminDesignTestFields'], status: 'active' },
  { name: 'ClientForm', path: 'src/components/admin/ClientForm.tsx', category: 'admin', description: 'Form for creating/editing client information', usedIn: ['V2Header'], status: 'active' },
  { name: 'CustomFieldsManager', path: 'src/components/admin/CustomFieldsManager.tsx', category: 'admin', description: 'Interface for managing custom model fields', usedIn: ['AdminDesignTestFields'], status: 'active' },
  { name: 'ModelForm', path: 'src/components/admin/ModelForm.tsx', category: 'admin', description: 'Comprehensive form for model registration/editing', usedIn: ['ModelsListContainer'], status: 'active' },
  { name: 'ModelsList', path: 'src/components/admin/ModelsList.tsx', category: 'admin', description: 'List view of all models with management actions', usedIn: ['ModelsListContainer'], status: 'active' },
  { name: 'ReviewsManager', path: 'src/components/admin/ReviewsManager.tsx', category: 'admin', description: 'Interface for managing user reviews', usedIn: ['AdminDesignTestSettings'], status: 'active' },
  { name: 'ServiceForm', path: 'src/components/admin/ServiceForm.tsx', category: 'admin', description: 'Form for creating/editing services', usedIn: ['V2Header'], status: 'active' },
  
  // Model Components
  { name: 'ModelAppointmentForm', path: 'src/components/model/ModelAppointmentForm.tsx', category: 'model', description: 'Appointment creation form for models', usedIn: ['V2Header', 'ModelV2AppointmentsPage'], status: 'active' },
  { name: 'ModelAppointmentsList', path: 'src/components/model/ModelAppointmentsList.tsx', category: 'model', description: 'List of model appointments with management options', usedIn: ['ModelV2AppointmentsPage'], status: 'active' },
  { name: 'ModelDashboardHome', path: 'src/components/model/ModelDashboardHome.tsx', category: 'model', description: 'Main dashboard view for models', usedIn: ['ModelV2DashboardPage'], status: 'active' },
  { name: 'ModelMediaManager', path: 'src/components/model/ModelMediaManager.tsx', category: 'model', description: 'Media management interface for models', usedIn: ['ModelV2MediaPage'], status: 'active' },
  { name: 'ModelProfileManager', path: 'src/components/model/ModelProfileManager.tsx', category: 'model', description: 'Profile editing interface for models', usedIn: ['ModelV2ProfilePage'], status: 'active' },
  { name: 'ModelStats', path: 'src/components/model/ModelStats.tsx', category: 'model', description: 'Statistics display for model performance', usedIn: ['ModelDashboardHome'], status: 'active' },
  { name: 'OrganizedMediaManager', path: 'src/components/model/OrganizedMediaManager.tsx', category: 'model', description: 'Organized view of model media content', usedIn: ['V2Header'], status: 'active' },
  
  // Chat Components
  { name: 'ChatInterface', path: 'src/components/chat/ChatInterface.tsx', category: 'chat', description: 'Main chat interface component', usedIn: ['ChatPage', 'ModelV2ChatPage'], status: 'active' },
  { name: 'ConversationsList', path: 'src/components/chat/ConversationsList.tsx', category: 'chat', description: 'List of user conversations', usedIn: ['ChatInterface'], status: 'active' },
  { name: 'MessageItem', path: 'src/components/chat/MessageItem.tsx', category: 'chat', description: 'Individual message display component', usedIn: ['ChatInterface'], status: 'active' },
  { name: 'MediaUpload', path: 'src/components/chat/MediaUpload.tsx', category: 'chat', description: 'Media upload component for chat', usedIn: ['ChatInterface'], status: 'active' },
  { name: 'ContactInfoSheet', path: 'src/components/chat/ContactInfoSheet.tsx', category: 'chat', description: 'Contact information side panel', usedIn: ['ChatInterface'], status: 'active' },
  
  // Core Components
  { name: 'Header', path: 'src/components/Header.tsx', category: 'core', description: 'Main application header with navigation', usedIn: ['App'], status: 'active' },
  { name: 'V2Header', path: 'src/components/V2Header.tsx', category: 'core', description: 'Enhanced header for V2 interface', usedIn: ['ModelV2Pages'], status: 'active' },
  { name: 'AuthRedirectHandler', path: 'src/components/AuthRedirectHandler.tsx', category: 'core', description: 'Handles authentication redirects', usedIn: ['App'], status: 'active' },
  { name: 'ModelCard', path: 'src/components/ModelCard.tsx', category: 'core', description: 'Card component for displaying model information', usedIn: ['HomePage', 'SearchPage'], status: 'active' },
  { name: 'ModelProfile', path: 'src/components/ModelProfile.tsx', category: 'core', description: 'Full model profile display', usedIn: ['ModelPage'], status: 'active' },
  { name: 'ProfilePhotoUpload', path: 'src/components/ProfilePhotoUpload.tsx', category: 'core', description: 'Component for uploading profile photos', usedIn: ['UserProfile'], status: 'active' },
  { name: 'UserProfile', path: 'src/components/UserProfile.tsx', category: 'core', description: 'User profile management interface', usedIn: ['Profile'], status: 'active' },
  { name: 'UserPlanInfo', path: 'src/components/UserPlanInfo.tsx', category: 'core', description: 'Display user plan information', usedIn: ['UserProfile'], status: 'active' },
  
  // Reviews Components
  { name: 'ReviewForm', path: 'src/components/reviews/ReviewForm.tsx', category: 'reviews', description: 'Form for creating user reviews', usedIn: ['ReviewsPage'], status: 'active' },
  { name: 'PendingReviewsPanel', path: 'src/components/reviews/PendingReviewsPanel.tsx', category: 'reviews', description: 'Panel showing pending reviews', usedIn: ['ReviewsPage'], status: 'active' },
  { name: 'PriveTrustPanel', path: 'src/components/reviews/PriveTrustPanel.tsx', category: 'reviews', description: 'Panel for PriveTrust status display', usedIn: ['ReviewsPage'], status: 'active' },
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

  const filteredComponents = useMemo(() => {
    return componentsData.filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || component.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus]);

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
    
    return { total, active, unused, mostUsed };
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
                <div className="text-2xl font-bold text-orange-600">{statistics.unused}</div>
                <div className="text-sm text-muted-foreground">Não Utilizados</div>
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar componentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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
                          <div>
                            <div className="text-sm font-medium mb-2">Usado em:</div>
                            <div className="flex flex-wrap gap-1">
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
                    <div key={component.name} className="flex items-center justify-between p-4 border rounded-lg">
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
                          {component.usedIn.length} uso(s)
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end max-w-64">
                          {component.usedIn.slice(0, 3).map((usage) => (
                            <Badge key={usage} variant="outline" className="text-xs">
                              {usage}
                            </Badge>
                          ))}
                          {component.usedIn.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{component.usedIn.length - 3} mais
                            </Badge>
                          )}
                        </div>
                      </div>
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