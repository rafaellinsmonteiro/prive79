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
  DollarSign,
  Clock,
  Plus,
  Edit,
  Copy,
  Trash2,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAppointments, Appointment } from '@/hooks/useAppointments';
import { useClientOptions, useServiceOptions } from '@/hooks/useSelectOptions';

const AgendaPage = () => {
  const { appointments, isLoading, createAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const { data: clientOptions = [] } = useClientOptions();
  const { data: serviceOptions = [] } = useServiceOptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

  // Estados para modal de edição/criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    service_id: '',
    appointment_date: '',
    appointment_time: '',
    duration: 60,
    price: 0,
    status: 'pending' as 'confirmed' | 'pending' | 'cancelled',
    location: '',
    observations: ''
  });

  const availableSlots = [
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
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
    const clientName = appointment.client?.name || '';
    const serviceName = appointment.service?.name || '';
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalAppointments = appointments.length;
  const totalRevenue = appointments
    .filter(apt => apt.status === 'confirmed')
    .reduce((sum, apt) => sum + apt.price, 0);
  const todayAppointments = appointments.filter(apt => 
    format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length;

  const handleServiceChange = (serviceId: string) => {
    const selectedService = serviceOptions.find(s => s.id === serviceId);
    if (selectedService) {
      setFormData(prev => ({
        ...prev,
        service_id: serviceId,
        price: selectedService.price,
        duration: selectedService.duration
      }));
    }
  };

  const handleOpenModal = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        client_id: appointment.client_id,
        service_id: appointment.service_id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        duration: appointment.duration,
        price: appointment.price,
        status: appointment.status,
        location: appointment.location || '',
        observations: appointment.observations || ''
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        client_id: '',
        service_id: '',
        appointment_date: format(new Date(), 'yyyy-MM-dd'),
        appointment_time: '',
        duration: 60,
        price: 0,
        status: 'pending',
        location: '',
        observations: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveAppointment = async () => {
    if (!formData.client_id || !formData.service_id || !formData.appointment_date || !formData.appointment_time) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Preço deve ser maior que zero');
      return;
    }

    try {
      if (editingAppointment) {
        await updateAppointment.mutateAsync({
          id: editingAppointment.id,
          ...formData
        });
      } else {
        await createAppointment.mutateAsync(formData);
      }
      setIsModalOpen(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment.mutateAsync(appointmentId);
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
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
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-white text-lg font-semibold">Agenda</h1>
          <Button
            onClick={() => handleOpenModal()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
        </div>

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
                  <p className="text-white font-semibold">R$ {totalRevenue.toFixed(2)}</p>
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
                        {appointment.client?.name}
                      </h3>
                      <Badge className={`${getStatusColor(appointment.status)} text-white text-xs px-2 py-0.5`}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                    
                    <p className="text-zinc-400 text-xs mb-2">
                      {appointment.service?.name}
                    </p>
                    
                    <div className="flex items-center space-x-4 mb-1">
                      <div className="flex items-center space-x-1">
                        <CalendarDays className="h-3 w-3 text-zinc-400" />
                        <span className="text-zinc-400 text-xs">
                          {format(new Date(appointment.appointment_date), "dd/MM/yyyy", { locale: ptBR })} às {appointment.appointment_time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3 text-green-500" />
                        <span className="text-green-500 text-xs font-medium">
                          R$ {appointment.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {appointment.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-zinc-400" />
                        <span className="text-zinc-400 text-xs">{appointment.location}</span>
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
                      <DropdownMenuItem onClick={() => handleOpenModal(appointment)} className="text-white focus:bg-zinc-700">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteAppointment(appointment.id)} className="text-red-400 focus:bg-zinc-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
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

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {clientOptions.map((client) => (
                    <SelectItem key={client.id} value={client.id} className="text-white focus:bg-zinc-700">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Serviço *</Label>
              <Select value={formData.service_id} onValueChange={handleServiceChange}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {serviceOptions.map((service) => (
                    <SelectItem key={service.id} value={service.id} className="text-white focus:bg-zinc-700">
                      {service.name} - R$ {service.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Horário *</Label>
                <Select value={formData.appointment_time} onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_time: value }))}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Horário" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
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
                <Label>Valor do Serviço *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Duração (minutos)</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observations}
                onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                placeholder="Observações sobre o agendamento..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                Cancelar
              </Button>
              <Button onClick={handleSaveAppointment} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {editingAppointment ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendaPage;