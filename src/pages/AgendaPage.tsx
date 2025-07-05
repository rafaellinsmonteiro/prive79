import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  CalendarDays, 
  Search, 
  MoreVertical,
  Filter,
  DollarSign,
  Clock,
  Plus,
  Edit,
  Copy,
  Trash2,
  User,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  phone: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Appointment {
  id: string;
  date: Date;
  time: string;
  duration: number;
  client: string;
  service: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
  location: string;
  observations?: string;
}

const AgendaPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  
  // Dados mockados de clientes
  const clients: Client[] = [
    { id: '1', name: 'Maria Silva', phone: '(11) 99999-1111' },
    { id: '2', name: 'Ana Santos', phone: '(11) 99999-2222' },
    { id: '3', name: 'Carla Lima', phone: '(11) 99999-3333' },
    { id: '4', name: 'Julia Costa', phone: '(11) 99999-4444' },
    { id: '5', name: 'Patricia Oliveira', phone: '(11) 99999-5555' }
  ];

  // Dados mockados de serviços
  const services: Service[] = [
    { id: '1', name: 'Corte + Escova', price: 150, duration: 90 },
    { id: '2', name: 'Massagem Relaxante', price: 200, duration: 60 },
    { id: '3', name: 'Companhia VIP', price: 500, duration: 120 },
    { id: '4', name: 'Jantar Executivo', price: 300, duration: 180 },
    { id: '5', name: 'Spa Completo', price: 250, duration: 120 }
  ];

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      date: new Date(),
      time: '14:00',
      duration: 90,
      client: 'Maria Silva',
      service: 'Corte + Escova',
      status: 'confirmed',
      price: 150,
      location: 'Domicílio',
      observations: 'Cliente preferencial'
    },
    {
      id: '2',
      date: new Date(),
      time: '16:00',
      duration: 60,
      client: 'Ana Santos',
      service: 'Massagem Relaxante',
      status: 'pending',
      price: 200,
      location: 'Hotel'
    },
    {
      id: '3',
      date: new Date(Date.now() + 86400000),
      time: '15:00',
      duration: 120,
      client: 'Carla Lima',
      service: 'Companhia VIP',
      status: 'confirmed',
      price: 500,
      location: 'Restaurante'
    }
  ]);

  // Estados para modal de edição/criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<{
    client: string;
    service: string;
    date: string;
    time: string;
    duration: number;
    price: number;
    status: 'confirmed' | 'pending' | 'cancelled';
    location: string;
    observations: string;
  }>({
    client: '',
    service: '',
    date: '',
    time: '',
    duration: 60,
    price: 0,
    status: 'pending',
    location: '',
    observations: ''
  });

  const availableSlots = [
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const locations = [
    'Domicílio',
    'Hotel',
    'Motel',
    'Restaurante',
    'Com Local',
    'Escritório',
    'Evento'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalAppointments = appointments.length;
  const totalRevenue = appointments
    .filter(apt => apt.status === 'confirmed')
    .reduce((sum, apt) => sum + apt.price, 0);
  const todayAppointments = appointments.filter(apt => 
    format(apt.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length;

  const handleServiceChange = (serviceId: string) => {
    const selectedService = services.find(s => s.id === serviceId);
    if (selectedService) {
      setFormData(prev => ({
        ...prev,
        service: selectedService.name,
        price: selectedService.price,
        duration: selectedService.duration
      }));
    }
  };

  const handleOpenModal = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        client: appointment.client,
        service: appointment.service,
        date: format(appointment.date, 'yyyy-MM-dd'),
        time: appointment.time,
        duration: appointment.duration,
        price: appointment.price,
        status: appointment.status,
        location: appointment.location,
        observations: appointment.observations || ''
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        client: '',
        service: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '',
        duration: 60,
        price: 0,
        status: 'pending',
        location: '',
        observations: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveAppointment = () => {
    if (!formData.client.trim() || !formData.service.trim() || !formData.date || !formData.time) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Preço deve ser maior que zero');
      return;
    }

    if (editingAppointment) {
      // Editar agendamento existente
      setAppointments(appointments.map(apt => 
        apt.id === editingAppointment.id 
          ? {
              ...apt,
              client: formData.client,
              service: formData.service,
              date: new Date(formData.date),
              time: formData.time,
              duration: formData.duration,
              price: formData.price,
              status: formData.status,
              location: formData.location,
              observations: formData.observations
            }
          : apt
      ));
      toast.success('Agendamento atualizado com sucesso!');
    } else {
      // Criar novo agendamento
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        client: formData.client,
        service: formData.service,
        date: new Date(formData.date),
        time: formData.time,
        duration: formData.duration,
        price: formData.price,
        status: formData.status,
        location: formData.location,
        observations: formData.observations
      };
      setAppointments([...appointments, newAppointment]);
      toast.success('Agendamento criado com sucesso!');
    }

    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const handleDuplicateAppointment = (appointment: Appointment) => {
    const duplicatedAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      client: `${appointment.client} (Cópia)`,
      status: 'pending'
    };
    setAppointments([...appointments, duplicatedAppointment]);
    toast.success('Agendamento duplicado com sucesso!');
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    setAppointments(appointments.filter(apt => apt.id !== appointmentId));
    toast.success('Agendamento removido com sucesso!');
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
      {/* Header */}
      <div className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">Agenda</h1>
              <p className="text-zinc-400 text-xs">{filteredAppointments.length} agendamentos</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleOpenModal()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Novo
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-zinc-400">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-800 border-zinc-700 z-50">
                <DropdownMenuItem 
                  onClick={() => setFilterStatus('all')}
                  className="text-white focus:bg-zinc-700"
                >
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFilterStatus('confirmed')}
                  className="text-white focus:bg-zinc-700"
                >
                  Confirmados
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFilterStatus('pending')}
                  className="text-white focus:bg-zinc-700"
                >
                  Pendentes
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setFilterStatus('cancelled')}
                  className="text-white focus:bg-zinc-700"
                >
                  Cancelados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar por cliente ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-zinc-400 text-xs">Total</p>
                  <p className="text-white font-semibold">{totalAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-zinc-400 text-xs">Hoje</p>
                  <p className="text-white font-semibold">{todayAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-zinc-400 text-xs">Receita</p>
                  <p className="text-white font-semibold">
                    R$ {totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <div className="space-y-3">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-white font-medium text-sm">
                        {appointment.client}
                      </h3>
                      <Badge 
                        className={`${getStatusColor(appointment.status)} text-white text-xs px-2 py-0.5`}
                      >
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                    
                    <p className="text-zinc-400 text-xs mb-2">
                      {appointment.service}
                    </p>
                    
                    <div className="flex items-center space-x-4 mb-1">
                      <div className="flex items-center space-x-1">
                        <CalendarDays className="h-3 w-3 text-zinc-400" />
                        <span className="text-zinc-400 text-xs">
                          {format(appointment.date, "dd/MM/yyyy", { locale: ptBR })} às {appointment.time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-zinc-400" />
                        <span className="text-zinc-400 text-xs">
                          {formatDuration(appointment.duration)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-green-500" />
                        <span className="text-green-500 text-xs font-medium">
                          R$ {appointment.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-zinc-400" />
                      <span className="text-zinc-400 text-xs">
                        {appointment.location}
                      </span>
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
                    <DropdownMenuContent className="bg-zinc-800 border-zinc-700 z-50">
                      <DropdownMenuItem 
                        onClick={() => handleOpenModal(appointment)}
                        className="text-white focus:bg-zinc-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar agendamento
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDuplicateAppointment(appointment)}
                        className="text-white focus:bg-zinc-700"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar agendamento
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-red-400 focus:bg-zinc-700 focus:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover agendamento
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-8">
            <CalendarDays className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Nenhum agendamento encontrado</h3>
            <p className="text-zinc-400 text-sm">
              {searchTerm ? 'Tente ajustar sua pesquisa' : 'Você ainda não tem agendamentos cadastrados'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Agendamento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-white" />
              </div>
              <span>{editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Select value={formData.client} onValueChange={(value) => setFormData(prev => ({ ...prev, client: value }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 z-50">
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.name} className="text-white focus:bg-zinc-700">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service">Serviço *</Label>
              <Select 
                value={services.find(s => s.name === formData.service)?.id || ''} 
                onValueChange={handleServiceChange}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 z-50">
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id} className="text-white focus:bg-zinc-700">
                      {service.name} - R$ {service.price.toFixed(2)} ({formatDuration(service.duration)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Horário *</Label>
                <Select value={formData.time} onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Horário" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 z-50">
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot} value={slot} className="text-white focus:bg-zinc-700">
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (min) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  className="bg-zinc-800 border-zinc-700 text-white"
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: Hotel, Domicílio, Restaurante..."
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'confirmed' | 'pending' | 'cancelled') => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 z-50">
                  <SelectItem value="pending" className="text-white focus:bg-zinc-700">Pendente</SelectItem>
                  <SelectItem value="confirmed" className="text-white focus:bg-zinc-700">Confirmado</SelectItem>
                  <SelectItem value="cancelled" className="text-white focus:bg-zinc-700">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                placeholder="Observações sobre o agendamento..."
                className="bg-zinc-800 border-zinc-700 text-white min-h-[80px]"
              />
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
                onClick={handleSaveAppointment}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                {editingAppointment ? 'Atualizar' : 'Criar'} Agendamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendaPage;