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
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'partial':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'pending':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted/50 text-muted-foreground border-border';
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
      {/* Não exibir header aqui pois já está na página principal */}
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-foreground">Carregando agendamentos...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Card 
              key={appointment.id} 
              className="bg-card border-border hover:bg-accent/50 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
              onClick={() => setSelectedAppointment(appointment)}
            >
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  {/* Informações principais */}
                  <div className="space-y-3">
                    <div className="flex items-center text-foreground font-medium group-hover:text-primary transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      {appointment.models?.name || 'Modelo não encontrada'}
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm ml-11">
                      <User className="h-4 w-4 mr-2 text-green-500" />
                      {appointment.clients?.name || 'Cliente não encontrado'}
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm ml-11">
                      {appointment.services?.name || 'Serviço não encontrado'}
                    </div>
                  </div>

                  {/* Data e hora */}
                  <div className="space-y-3">
                    <div className="flex items-center text-foreground">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center mr-3">
                        <Calendar className="h-4 w-4 text-blue-500" />
                      </div>
                      {format(new Date(appointment.appointment_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm ml-11">
                      <Clock className="h-4 w-4 mr-2" />
                      {appointment.appointment_time} ({appointment.duration}min)
                    </div>
                    {appointment.location && (
                      <div className="flex items-center text-muted-foreground text-sm ml-11">
                        <MapPin className="h-4 w-4 mr-2" />
                        {appointment.location}
                      </div>
                    )}
                  </div>

                  {/* Status e pagamento */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Badge className={getStatusColor(appointment.status)} variant="outline">
                        {getStatusText(appointment.status)}
                      </Badge>
                      <Badge className={getPaymentStatusColor(appointment.payment_status)} variant="outline">
                        {getPaymentStatusText(appointment.payment_status)}
                      </Badge>
                    </div>
                    <div className="flex items-center text-foreground text-sm">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg flex items-center justify-center mr-2">
                        <DollarSign className="h-3 w-3 text-green-500" />
                      </div>
                      R$ {appointment.price?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  {/* Indicadores e ações */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {appointment.created_by_admin && (
                        <Badge variant="outline" className="text-purple-500 border-purple-500/20 bg-purple-500/10">
                          Admin
                        </Badge>
                      )}
                      {appointment.is_recurring_series && (
                        <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/10">
                          <Repeat className="h-3 w-3 mr-1" />
                          {appointment.recurrence_type}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-muted-foreground text-sm">
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
                    <Separator className="my-4 bg-border" />
                    <div className="text-sm text-muted-foreground bg-accent/30 rounded-lg p-3">
                      <strong className="text-foreground">Observações do Admin:</strong> {appointment.admin_notes}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}

          {appointments.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhum agendamento encontrado</h3>
                <p className="text-muted-foreground">Crie o primeiro agendamento para começar.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentsManager;