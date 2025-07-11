import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Clock, User, MapPin, DollarSign, MessageSquare, Paperclip, Repeat } from 'lucide-react';
import { useAdminAppointments, AdminAppointment } from '@/hooks/useAdminAppointments';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminAppointmentForm } from './AdminAppointmentForm';
import { AdminAppointmentDetails } from './AdminAppointmentDetails';

const AppointmentsManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointment | null>(null);
  const { appointments, isLoading } = useAdminAppointments();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'partial':
        return 'Parcial';
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };

  if (selectedAppointment) {
    return (
      <AdminAppointmentDetails 
        appointment={selectedAppointment}
        onBack={() => setSelectedAppointment(null)}
      />
    );
  }

  if (showForm) {
    return (
      <AdminAppointmentForm onClose={() => setShowForm(false)} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestão de Agendamentos</h2>
          <p className="text-zinc-400">Gerencie todos os agendamentos da plataforma</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-white">Carregando agendamentos...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Card 
              key={appointment.id} 
              className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
              onClick={() => setSelectedAppointment(appointment)}
            >
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  {/* Informações principais */}
                  <div className="space-y-2">
                    <div className="flex items-center text-white font-medium">
                      <User className="h-4 w-4 mr-2 text-blue-400" />
                      {appointment.models?.name || 'Modelo não encontrada'}
                    </div>
                    <div className="flex items-center text-zinc-300 text-sm">
                      <User className="h-4 w-4 mr-2 text-green-400" />
                      {appointment.clients?.name || 'Cliente não encontrado'}
                    </div>
                    <div className="flex items-center text-zinc-300 text-sm">
                      {appointment.services?.name || 'Serviço não encontrado'}
                    </div>
                  </div>

                  {/* Data e hora */}
                  <div className="space-y-2">
                    <div className="flex items-center text-white">
                      <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                      {format(new Date(appointment.appointment_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    <div className="flex items-center text-zinc-300 text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      {appointment.appointment_time} ({appointment.duration}min)
                    </div>
                    {appointment.location && (
                      <div className="flex items-center text-zinc-300 text-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        {appointment.location}
                      </div>
                    )}
                  </div>

                  {/* Status e pagamento */}
                  <div className="space-y-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                    <Badge className={getPaymentStatusColor(appointment.payment_status)}>
                      {getPaymentStatusText(appointment.payment_status)}
                    </Badge>
                    <div className="flex items-center text-white text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                      R$ {appointment.price?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  {/* Indicadores e ações */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {appointment.created_by_admin && (
                        <Badge variant="outline" className="text-purple-400 border-purple-400">
                          Admin
                        </Badge>
                      )}
                      {appointment.is_recurring_series && (
                        <Badge variant="outline" className="text-blue-400 border-blue-400">
                          <Repeat className="h-3 w-3 mr-1" />
                          {appointment.recurrence_type}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                      {appointment.comments && appointment.comments.length > 0 && (
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {appointment.comments.length}
                        </div>
                      )}
                      {appointment.attachments && appointment.attachments.length > 0 && (
                        <div className="flex items-center">
                          <Paperclip className="h-4 w-4 mr-1" />
                          {appointment.attachments.length}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {appointment.admin_notes && (
                  <>
                    <Separator className="my-4" />
                    <div className="text-sm text-zinc-300">
                      <strong>Observações do Admin:</strong> {appointment.admin_notes}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}

          {appointments.length === 0 && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Nenhum agendamento encontrado</h3>
                <p className="text-zinc-400">Crie o primeiro agendamento para começar.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentsManager;