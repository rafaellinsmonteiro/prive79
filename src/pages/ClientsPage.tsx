import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Star
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  const [clients] = useState<Client[]>([
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
                        <DropdownMenuItem className="text-white focus:bg-zinc-700">
                          Ver perfil completo
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white focus:bg-zinc-700">
                          Agendar compromisso
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white focus:bg-zinc-700">
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
    </div>
  );
};

export default ClientsPage;