import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Star, 
  Search, 
  MoreVertical,
  Filter,
  DollarSign,
  Clock,
  Plus,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // em minutos
  isActive: boolean;
  createdAt: Date;
}

const ServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Corte + Escova',
      description: 'Corte de cabelo profissional com escova modeladora',
      price: 150,
      duration: 90,
      isActive: true,
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Massagem Relaxante',
      description: 'Massagem completa para relaxamento total',
      price: 200,
      duration: 60,
      isActive: true,
      createdAt: new Date('2024-01-10')
    },
    {
      id: '3',
      name: 'Companhia VIP',
      description: 'Acompanhamento para eventos especiais',
      price: 500,
      duration: 120,
      isActive: false,
      createdAt: new Date('2024-01-08')
    }
  ]);

  // Estados para modal de edição/criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    isActive: true
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-500';
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Ativo' : 'Inativo';
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && service.isActive) ||
      (filterStatus === 'inactive' && !service.isActive);
    return matchesSearch && matchesFilter;
  });

  const totalServices = services.length;
  const averagePrice = services.length > 0 
    ? services.reduce((sum, service) => sum + service.price, 0) / services.length 
    : 0;

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price,
        duration: service.duration,
        isActive: service.isActive
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        duration: 60,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveService = () => {
    if (!formData.name.trim()) {
      toast.error('Nome do serviço é obrigatório');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Preço deve ser maior que zero');
      return;
    }

    if (editingService) {
      // Editar serviço existente
      setServices(services.map(service => 
        service.id === editingService.id 
          ? {
              ...service,
              name: formData.name,
              description: formData.description,
              price: formData.price,
              duration: formData.duration,
              isActive: formData.isActive
            }
          : service
      ));
      toast.success('Serviço atualizado com sucesso!');
    } else {
      // Criar novo serviço
      const newService: Service = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: formData.price,
        duration: formData.duration,
        isActive: formData.isActive,
        createdAt: new Date()
      };
      setServices([...services, newService]);
      toast.success('Serviço criado com sucesso!');
    }

    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleDuplicateService = (service: Service) => {
    const duplicatedService: Service = {
      ...service,
      id: Date.now().toString(),
      name: `${service.name} (Cópia)`,
      createdAt: new Date()
    };
    setServices([...services, duplicatedService]);
    toast.success('Serviço duplicado com sucesso!');
  };

  const handleDeleteService = (serviceId: string) => {
    setServices(services.filter(service => service.id !== serviceId));
    toast.success('Serviço removido com sucesso!');
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="p-4">
        {/* Botão para novo serviço */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white text-lg font-semibold">Serviços</h1>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleOpenModal()}
              size="sm"
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Novo Serviço
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-pink-500" />
                <div>
                  <p className="text-zinc-400 text-xs">Total de Serviços</p>
                  <p className="text-white font-semibold">{totalServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-zinc-400 text-xs">Valor Médio</p>
                  <p className="text-white font-semibold">
                    R$ {averagePrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services List */}
        <div className="space-y-3">
          {filteredServices.map((service) => (
            <Card key={service.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-white font-medium text-sm">
                        {service.name}
                      </h3>
                      <Badge 
                        className={`${getStatusColor(service.isActive)} text-white text-xs px-2 py-0.5`}
                      >
                        {getStatusLabel(service.isActive)}
                      </Badge>
                    </div>
                    
                    {service.description && (
                      <p className="text-zinc-400 text-xs mb-2 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-green-500" />
                        <span className="text-green-500 text-xs font-medium">
                          R$ {service.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-zinc-400" />
                        <span className="text-zinc-400 text-xs">
                          {formatDuration(service.duration)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-white h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
                      <DropdownMenuItem 
                        onClick={() => handleOpenModal(service)}
                        className="text-white focus:bg-zinc-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar serviço
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDuplicateService(service)}
                        className="text-white focus:bg-zinc-700"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar serviço
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-400 focus:bg-zinc-700 focus:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover serviço
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-8">
            <Star className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Nenhum serviço encontrado</h3>
            <p className="text-zinc-400 text-sm">
              {searchTerm ? 'Tente ajustar sua pesquisa' : 'Você ainda não tem serviços cadastrados'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Serviço */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-white" />
              </div>
              <span>Informações do Serviço</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Serviço *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Corte + Escova"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva os detalhes do serviço..."
                className="bg-zinc-800 border-zinc-700 text-white min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos) *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  placeholder="60"
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-zinc-700 bg-zinc-800 text-pink-600 focus:ring-pink-500"
              />
              <Label htmlFor="isActive" className="text-sm">
                Serviço ativo
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveService}
                className="flex-1 bg-pink-600 hover:bg-pink-700"
              >
                <Star className="h-4 w-4 mr-2" />
                Salvar Serviço
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesPage;