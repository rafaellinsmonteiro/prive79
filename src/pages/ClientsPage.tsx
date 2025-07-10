import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  MessageCircle, 
  Phone, 
  Calendar,
  MoreVertical,
  Filter,
  UserCheck,
  Clock,
  Heart,
  Star,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useClients, Client } from '@/hooks/useClients';

const ClientsPage = () => {
  const { clients, isLoading, createClient, updateClient, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Estados para modal de edição/criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    is_active: true
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-500';
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Ativo' : 'Inativo';
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && client.is_active) ||
      (filterStatus === 'inactive' && !client.is_active);
    return matchesSearch && matchesFilter;
  });

  const formatLastContact = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} semanas atrás`;
    return `${Math.ceil(diffDays / 30)} meses atrás`;
  };

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        phone: client.phone || '',
        email: client.email || '',
        address: client.address || '',
        notes: client.notes || '',
        is_active: client.is_active
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveClient = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      if (editingClient) {
        await updateClient.mutateAsync({
          id: editingClient.id,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          notes: formData.notes,
          is_active: formData.is_active
        });
      } else {
        await createClient.mutateAsync({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          notes: formData.notes,
          is_active: formData.is_active
        });
      }

      setIsModalOpen(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      await deleteClient.mutateAsync(clientId);
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="p-4">
        {/* Botão para novo cliente */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white text-lg font-semibold">Meus Clientes</h1>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleOpenModal()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Novo Cliente
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar clientes..."
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
                <UserCheck className="h-4 w-4 text-green-500" />
                <div>
                   <p className="text-zinc-400 text-xs">Ativos</p>
                   <p className="text-white font-semibold">
                     {clients.filter(c => c.is_active).length}
                   </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                 <Star className="h-4 w-4 text-yellow-500" />
                 <div>
                   <p className="text-zinc-400 text-xs">Total</p>
                   <p className="text-white font-semibold">
                     {clients.length}
                   </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients List */}
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-zinc-700 text-white">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                     <div className="flex-1 min-w-0">
                       <div className="flex items-center space-x-2">
                         <h3 className="text-white font-medium text-sm truncate">
                           {client.name}
                         </h3>
                         <Badge 
                           className={`${getStatusColor(client.is_active)} text-white text-xs px-2 py-0.5`}
                         >
                           {getStatusLabel(client.is_active)}
                         </Badge>
                       </div>
                       
                       <div className="flex items-center space-x-4 mt-1">
                         {client.phone && (
                           <div className="flex items-center space-x-1">
                             <Phone className="h-3 w-3 text-zinc-400" />
                             <span className="text-zinc-400 text-xs">
                               {client.phone}
                             </span>
                           </div>
                         )}
                         {client.email && (
                           <div className="flex items-center space-x-1">
                             <span className="text-zinc-400 text-xs">
                               {client.email}
                             </span>
                           </div>
                         )}
                       </div>
                     </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-white h-8 w-8 p-0"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-white h-8 w-8 p-0"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
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
                           onClick={() => handleOpenModal(client)}
                           className="text-white focus:bg-zinc-700"
                         >
                           <Edit className="h-4 w-4 mr-2" />
                           Editar cliente
                         </DropdownMenuItem>
                         <DropdownMenuItem 
                           onClick={() => handleDeleteClient(client.id)}
                           className="text-red-400 focus:bg-zinc-700 focus:text-red-400"
                         >
                           <Trash2 className="h-4 w-4 mr-2" />
                           Remover cliente
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Nenhum cliente encontrado</h3>
            <p className="text-zinc-400 text-sm">
              {searchTerm ? 'Tente ajustar sua pesquisa' : 'Você ainda não tem clientes cadastrados'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Cliente */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome completo do cliente"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="cliente@email.com"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Endereço completo"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações sobre o cliente..."
                className="bg-zinc-800 border-zinc-700 text-white min-h-[80px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="active" className="text-sm">
                Cliente ativo
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
                onClick={handleSaveClient}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {editingClient ? 'Salvar' : 'Criar Cliente'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsPage;