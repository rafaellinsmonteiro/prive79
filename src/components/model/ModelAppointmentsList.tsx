import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CalendarDays, 
  Search, 
  MoreVertical,
  DollarSign,
  Clock,
  Plus,
  Edit,
  Trash2,
  MapPin,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAppointments, Appointment } from '@/hooks/useAppointments';
import { usePayments } from '@/hooks/usePayments';
import { ModelAppointmentForm } from './ModelAppointmentForm';
import ModelWorkingHours from './ModelWorkingHours';

const ModelAppointmentsList = () => {
  const { appointments, isLoading, deleteAppointment } = useAppointments();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'cancelled' | 'completed'>('all');

  // Estados para modal de edição/criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0,
    payment_method: '',
    notes: ''
  });
  const { payments, createPayment, deletePayment, totalPaid } = usePayments(editingAppointment?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Concluído';
      default: return 'Desconhecido';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'pending': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'partial': return 'Parcial';
      case 'pending': return 'Pendente';
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
    .reduce((sum, apt) => sum + (apt.total_paid || 0), 0);
  const todayAppointments = appointments.filter(apt => 
    format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length;

  const getCreatorTag = (appointment: Appointment) => {
    if (appointment.created_by_admin) {
      return { text: 'Criado pelo admin', color: 'bg-purple-500' };
    }
    return { text: 'Criado por mim', color: 'bg-green-600' };
  };

  const handleOpenModal = (appointment?: Appointment) => {
    if (appointment) {
      if (appointment.created_by_admin) {
        toast.error('Agendamentos criados pelo admin não podem ser editados');
        return;
      }
      setEditingAppointment(appointment);
    } else {
      setEditingAppointment(null);
    }
    setIsModalOpen(true);
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (appointment.created_by_admin) {
      toast.error('Agendamentos criados pelo admin não podem ser removidos');
      return;
    }
    
    try {
      await deleteAppointment.mutateAsync(appointment.id);
      toast.success('Agendamento removido com sucesso!');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Erro ao remover agendamento');
    }
  };

  const handleOpenPaymentModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setPaymentFormData({
      amount: 0,
      payment_method: '',
      notes: ''
    });
    setIsPaymentModalOpen(true);
  };

  const handleAddPayment = async () => {
    if (!editingAppointment || paymentFormData.amount <= 0) {
      toast.error('Valor do pagamento deve ser maior que zero');
      return;
    }

    try {
      await createPayment.mutateAsync({
        appointment_id: editingAppointment.id,
        amount: paymentFormData.amount,
        payment_date: new Date().toISOString(),
        payment_method: paymentFormData.payment_method,
        notes: paymentFormData.notes
      });
      setIsPaymentModalOpen(false);
      setPaymentFormData({ amount: 0, payment_method: '', notes: '' });
      toast.success('Pagamento adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Erro ao adicionar pagamento');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <Button
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
          
          <ModelWorkingHours 
            trigger={
              <Button variant="outline" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horários de Atendimento
              </Button>
            }
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Pesquisar por cliente ou serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <p className="text-muted-foreground text-sm">Total</p>
                <p className="text-2xl font-bold text-foreground">{totalAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-muted-foreground text-sm">Hoje</p>
                <p className="text-2xl font-bold text-foreground">{todayAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-muted-foreground text-sm">Receita</p>
                <p className="text-2xl font-bold text-foreground">R$ {totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-sm">
                      {appointment.client?.name}
                    </h3>
                    <Badge className={`${getStatusColor(appointment.status)} text-white text-xs px-2 py-0.5`}>
                      {getStatusLabel(appointment.status)}
                    </Badge>
                    <Badge className={`${getPaymentStatusColor(appointment.payment_status)} text-white text-xs px-2 py-0.5`}>
                      {getPaymentStatusLabel(appointment.payment_status)}
                    </Badge>
                    <Badge className={`${getCreatorTag(appointment).color} text-white text-xs px-2 py-0.5`}>
                      {getCreatorTag(appointment).text}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-2">
                    {appointment.service?.name}
                  </p>
                  
                  <div className="flex items-center space-x-4 mb-1">
                    <div className="flex items-center space-x-1">
                      <CalendarDays className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">
                        {format(new Date(appointment.appointment_date), "dd/MM/yyyy", { locale: ptBR })} às {appointment.appointment_time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3 text-green-500" />
                      <span className="text-green-500 text-sm font-medium">
                        R$ {appointment.price.toFixed(2)}
                        {appointment.total_paid && appointment.total_paid > 0 && (
                          <span className="text-blue-500 ml-1">
                            (Pago: R$ {appointment.total_paid.toFixed(2)})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  {appointment.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">{appointment.location}</span>
                    </div>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenModal(appointment)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenPaymentModal(appointment)}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pagamentos
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteAppointment(appointment)}
                      className="text-destructive focus:text-destructive"
                    >
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
        <div className="text-center py-12">
          <CalendarDays className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Nenhum agendamento encontrado</h3>
          <p className="text-muted-foreground text-sm">
            {searchTerm ? 'Tente ajustar sua pesquisa' : 'Você ainda não tem agendamentos cadastrados'}
          </p>
        </div>
      )}

      {/* Appointment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <ModelAppointmentForm 
            onClose={() => setIsModalOpen(false)} 
            appointment={editingAppointment}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Pagamentos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingAppointment && (
              <div className="p-3 bg-accent rounded-lg">
                <p className="text-sm font-medium">{editingAppointment.client?.name}</p>
                <p className="text-xs text-muted-foreground">{editingAppointment.service?.name}</p>
                <p className="text-sm mt-1">
                  <span className="text-muted-foreground">Total: </span>
                  <span className="text-green-600 font-medium">R$ {editingAppointment.price.toFixed(2)}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Pago: </span>
                  <span className="text-blue-600 font-medium">R$ {totalPaid.toFixed(2)}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Restante: </span>
                  <span className="text-orange-600 font-medium">
                    R$ {Math.max(0, editingAppointment.price - totalPaid).toFixed(2)}
                  </span>
                </p>
              </div>
            )}

            {payments.length > 0 && (
              <div className="space-y-2">
                <Label>Pagamentos Anteriores</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-2 bg-accent rounded text-sm">
                      <div>
                        <span className="text-green-600 font-medium">R$ {payment.amount.toFixed(2)}</span>
                        {payment.payment_method && (
                          <span className="text-muted-foreground ml-2">({payment.payment_method})</span>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.payment_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePayment.mutateAsync(payment.id)}
                        className="text-destructive hover:text-destructive h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Separator />
              </div>
            )}

            <div className="space-y-3">
              <Label>Adicionar Pagamento</Label>
              
              <div className="space-y-2">
                <Label>Valor *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentFormData.amount}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select value={paymentFormData.payment_method} onValueChange={(value) => setPaymentFormData(prev => ({ ...prev, payment_method: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={paymentFormData.notes}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações sobre o pagamento..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)} className="flex-1">
                Fechar
              </Button>
              <Button onClick={handleAddPayment} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelAppointmentsList;