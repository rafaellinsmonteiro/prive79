import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Briefcase, MapPin, Home, User } from 'lucide-react';
import { useServices, Service } from '@/hooks/useServices';
import { useToast } from '@/hooks/use-toast';

const serviceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser positivo'),
  duration: z.number().min(1, 'Duração deve ser pelo menos 1 minuto'),
  max_people: z.number().min(1, 'Máximo de pessoas deve ser pelo menos 1').max(10, 'Máximo de 10 pessoas'),
  is_active: z.boolean(),
  location_types: z.array(z.string()).min(1, 'Selecione pelo menos um local'),
  service_address: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  open,
  onOpenChange,
  service,
}) => {
  const { createService, updateService } = useServices();
  const { toast } = useToast();
  const isEditing = !!service;

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      price: service?.price || 0,
      duration: service?.duration || 60,
      max_people: service?.max_people || 1,
      is_active: service?.is_active ?? true,
      location_types: service?.location_types || ['online'],
      service_address: service?.service_address || '',
    },
  });

  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        description: service.description || '',
        price: service.price,
        duration: service.duration,
        max_people: service.max_people,
        is_active: service.is_active,
        location_types: service.location_types || ['online'],
        service_address: service.service_address || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        duration: 60,
        max_people: 1,
        is_active: true,
        location_types: ['online'],
        service_address: '',
      });
    }
  }, [service, form]);

  const onSubmit = async (data: ServiceFormData) => {
    try {
      if (isEditing && service) {
        await updateService.mutateAsync({ 
          id: service.id, 
          ...data,
          description: data.description || null,
        });
        toast({
          title: "Serviço atualizado",
          description: "O serviço foi atualizado com sucesso.",
        });
      } else {
        await createService.mutateAsync({
          name: data.name,
          description: data.description || null,
          price: data.price,
          duration: data.duration,
          max_people: data.max_people,
          is_active: data.is_active,
          location_types: data.location_types,
          service_address: data.service_address || null,
        });
        toast({
          title: "Serviço criado",
          description: "O serviço foi criado com sucesso.",
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o serviço.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span>{isEditing ? 'Editar Serviço' : 'Novo Serviço'}</span>
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do serviço" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição do serviço (opcional)" 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (min)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="60" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Serviço Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      O serviço estará disponível para agendamento
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_people"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Máximo de Pessoas</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="1" 
                      min="1"
                      max="10"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <div className="text-sm text-muted-foreground">
                    Quantidade máxima de pessoas permitidas neste serviço
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Types */}
            <FormField
              control={form.control}
              name="location_types"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Local do Serviço
                  </FormLabel>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="online"
                        checked={field.value.includes('online')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...field.value, 'online']);
                          } else {
                            field.onChange(field.value.filter((v: string) => v !== 'online'));
                          }
                        }}
                      />
                      <label
                        htmlFor="online"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Online
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="my_address"
                        checked={field.value.includes('my_address')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...field.value, 'my_address']);
                          } else {
                            field.onChange(field.value.filter((v: string) => v !== 'my_address'));
                          }
                        }}
                      />
                      <label
                        htmlFor="my_address"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
                      >
                        <Home className="h-4 w-4" />
                        Meu endereço
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="client_address"
                        checked={field.value.includes('client_address')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...field.value, 'client_address']);
                          } else {
                            field.onChange(field.value.filter((v: string) => v !== 'client_address'));
                          }
                        }}
                      />
                      <label
                        htmlFor="client_address"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
                      >
                        <User className="h-4 w-4" />
                        Endereço do cliente
                      </label>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Selecione onde o serviço pode ser realizado
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service Address - Only show when "my_address" is selected */}
            {form.watch('location_types')?.includes('my_address') && (
              <FormField
                control={form.control}
                name="service_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meu Endereço Completo</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Digite seu endereço completo para o serviço..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <div className="text-sm text-muted-foreground">
                      Este endereço será mostrado para os clientes quando selecionarem "Meu endereço"
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createService.isPending || updateService.isPending}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 w-full sm:w-auto"
              >
                {isEditing ? 'Atualizar' : 'Criar'} Serviço
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};