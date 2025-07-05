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
  Edit
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'vip';
  lastContact: Date;
  totalSessions: number;
  rating: number;
  phone: string;
  notes?: string;
  favorite: boolean;
}

const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'vip'>('all');
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'João Silva',
      status: 'active',
      lastContact: new Date('2024-01-15'),
      totalSessions: 12,
      rating: 5,
      phone: '(11) 99999-9999',
      favorite: true
    },
    {
      id: '2',
      name: 'Pedro Santos',
      status: 'vip',
      lastContact: new Date('2024-01-10'),
      totalSessions: 25,
      rating: 5,
      phone: '(11) 88888-8888',
      favorite: true
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      status: 'active',
      lastContact: new Date('2024-01-08'),
      totalSessions: 8,
      rating: 4,
      phone: '(11) 77777-7777',
      favorite: false
    },
    {
      id: '4',
      name: 'Roberto Lima',
      status: 'inactive',
      lastContact: new Date('2023-12-20'),
      totalSessions: 3,
      rating: 4,
      phone: '(11) 66666-6666',
      favorite: false
    }
  ]);

  // Estados para modal de edição/criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    status: 'active' as Client['status'],
    notes: '',
    favorite: false
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'vip': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'vip': return 'VIP';
      case 'inactive': return 'Inativo';
      default: return 'Desconhecido';
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
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
        phone: client.phone,
        status: client.status,
        notes: client.notes || '',
        favorite: client.favorite
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        phone: '',
        status: 'active',
        notes: '',
        favorite: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveClient = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Nome e telefone são obrigatórios');
      return;
    }

    if (editingClient) {
      // Editar cliente existente
      setClients(clients.map(client => 
        client.id === editingClient.id 
          ? {
              ...client,
              name: formData.name,
              phone: formData.phone,
              status: formData.status,
              notes: formData.notes,
              favorite: formData.favorite
            }
          : client
      ));
      toast.success('Cliente atualizado com sucesso!');
    } else {
      // Criar novo cliente
      const newClient: Client = {
        id: Date.now().toString(),
        name: formData.name,
        phone: formData.phone, 
        status: formData.status,
        lastContact: new Date(),
        totalSessions: 0,
        rating: 0,
        notes: formData.notes,
        favorite: formData.favorite
      };
      setClients([...clients, newClient]);
      toast.success('Cliente criado com sucesso!');
    }

    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleToggleFavorite = (clientId: string) => {
    setClients(clients.map(client => 
      client.id === clientId 
        ? { ...client, favorite: !client.favorite }
        : client
    ));
    const client = clients.find(c => c.id === clientId);
    toast.success(
      client?.favorite 
        ? 'Cliente removido dos favoritos' 
        : 'Cliente adicionado aos favoritos'
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">Meus Clientes</h1>
              <p className="text-zinc-400 text-xs">{filteredClients.length} clientes</p>
            </div>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo Cliente
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-zinc-400">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
              <DropdownMenuItem 
                onClick={() => setFilterStatus('all')}
                className="text-white focus:bg-zinc-700"
              >
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setFilterStatus('active')}
                className="text-white focus:bg-zinc-700"
              >
                Ativos
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setFilterStatus('vip')}
                className="text-white focus:bg-zinc-700"
              >
                VIP
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setFilterStatus('inactive')}
                className="text-white focus:bg-zinc-700"
              >
                Inativos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4">
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
                    {clients.filter(c => c.status === 'active').length}
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
                  <p className="text-zinc-400 text-xs">VIP</p>
                  <p className="text-white font-semibold">
                    {clients.filter(c => c.status === 'vip').length}
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
                        <AvatarImage src={client.avatar} />
                        <AvatarFallback className="bg-zinc-700 text-white">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {client.favorite && (
                        <Heart className="absolute -top-1 -right-1 h-4 w-4 text-red-500 fill-current" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-medium text-sm truncate">
                          {client.name}
                        </h3>
                        <Badge 
                          className={`${getStatusColor(client.status)} text-white text-xs px-2 py-0.5`}
                        >
                          {getStatusLabel(client.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-zinc-400" />
                          <span className="text-zinc-400 text-xs">
                            {formatLastContact(client.lastContact)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-zinc-400" />
                          <span className="text-zinc-400 text-xs">
                            {client.totalSessions} sessões
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < client.rating 
                                ? 'text-yellow-500 fill-current' 
                                : 'text-zinc-600'
                            }`}
                          />
                        ))}
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
                        <DropdownMenuItem className="text-white focus:bg-zinc-700">
                          <Calendar className="h-4 w-4 mr-2" />
                          Agendar compromisso
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleFavorite(client.id)}
                          className="text-white focus:bg-zinc-700"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          {client.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white focus:bg-zinc-700">
                          Histórico de sessões
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
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: Client['status']) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="active" className="text-white focus:bg-zinc-700">
                    Ativo
                  </SelectItem>
                  <SelectItem value="vip" className="text-white focus:bg-zinc-700">
                    VIP
                  </SelectItem>
                  <SelectItem value="inactive" className="text-white focus:bg-zinc-700">
                    Inativo
                  </SelectItem>
                </SelectContent>
              </Select>
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
                id="favorite"
                checked={formData.favorite}
                onChange={(e) => setFormData(prev => ({ ...prev, favorite: e.target.checked }))}
                className="rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="favorite" className="text-sm">
                Marcar como favorito
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