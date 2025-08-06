import React, { useState } from 'react';
import { Star, TrendingUp, Users, Plus, Edit2, Copy, Trash2, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useServices, Service } from '@/hooks/useServices';
import { ServiceForm } from '@/components/admin/ServiceForm';
import V2VipModel from '@/components/V2VipModel';
import { useToast } from '@/hooks/use-toast';

const ModelV2ServicesPage = () => {
  const { services, isLoading, createService, deleteService } = useServices();
  const { toast } = useToast();
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowServiceForm(true);
  };

  const handleDuplicateService = async (service: Service) => {
    try {
      await createService.mutateAsync({
        name: `${service.name} (Cópia)`,
        description: service.description,
        price: service.price,
        duration: service.duration,
        max_people: service.max_people,
        is_active: service.is_active,
        location_types: service.location_types || ['online'],
        service_address: service.service_address || null,
      });
      toast({
        title: "Serviço duplicado",
        description: "O serviço foi duplicado com sucesso.",
      });
    } catch (error) {
      console.error('Error duplicating service:', error);
      toast({
        title: "Erro",
        description: "Erro ao duplicar o serviço.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await deleteService.mutateAsync(serviceId);
      toast({
        title: "Serviço excluído",
        description: "O serviço foi excluído com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir o serviço.",
        variant: "destructive",
      });
    }
  };

  const handleCreateNew = () => {
    setEditingService(undefined);
    setShowServiceForm(true);
  };

  const handleCloseForm = () => {
    setShowServiceForm(false);
    setEditingService(undefined);
  };

  return (
    <V2VipModel 
      title="Serviços"
      subtitle="Gerencie seus serviços e preços."
      activeId="services"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">{services?.length || 0}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold text-foreground">{services?.filter(s => s.is_active).length || 0}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Preço Médio</p>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {services?.length ? (services.reduce((sum, s) => sum + s.price, 0) / services.length).toFixed(0) : '0'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inativos</p>
                  <p className="text-2xl font-bold text-foreground">{services?.filter(s => !s.is_active).length || 0}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services List */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Meus Serviços</h2>
              <Button 
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Serviço
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Carregando serviços...</div>
            ) : services?.length ? (
              <div className="grid gap-4">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-foreground truncate">{service.name}</h3>
                        <Badge variant={service.is_active ? 'default' : 'secondary'} className="shrink-0">
                          {service.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{service.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-primary font-medium">R$ {service.price}</span>
                        <span className="text-muted-foreground">{service.duration}min</span>
                        <span className="text-muted-foreground">Máx: {service.max_people} pessoa(s)</span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditService(service)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateService(service)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o serviço "{service.name}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteService(service.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">Nenhum serviço cadastrado ainda.</p>
                <Button 
                  onClick={handleCreateNew}
                  variant="outline"
                  className="mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Serviço
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Form Modal */}
        <ServiceForm
          open={showServiceForm}
          onOpenChange={handleCloseForm}
          service={editingService}
        />
      </div>
    </V2VipModel>
  );
};

export default ModelV2ServicesPage;