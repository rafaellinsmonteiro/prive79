import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useClientOptions, useServiceOptions } from '@/hooks/useSelectOptions';
import { useAppointments, Appointment } from '@/hooks/useAppointments';

interface ModelAppointmentFormProps {
  onClose: () => void;
  appointment?: Appointment | null;
}

export const ModelAppointmentForm = ({ onClose, appointment }: ModelAppointmentFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    client_id: '',
    service_id: '',
    appointment_time: '',
    duration: 60,
    price: 0,
    status: 'pending' as 'confirmed' | 'pending' | 'cancelled' | 'completed',
    payment_status: 'pending' as 'pending' | 'partial' | 'paid',
    location: '',
    observations: ''
  });

  const { data: clientOptions = [] } = useClientOptions();
  const { data: serviceOptions = [] } = useServiceOptions();
  const { createAppointment, updateAppointment } = useAppointments();

  const availableSlots = [
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  // Populate form data if editing an appointment
  useEffect(() => {
    if (appointment) {
      setSelectedDate(new Date(appointment.appointment_date));
      setFormData({
        client_id: appointment.client_id,
        service_id: appointment.service_id,
        appointment_time: appointment.appointment_time,
        duration: appointment.duration,
        price: appointment.price,
        status: appointment.status,
        payment_status: appointment.payment_status,
        location: appointment.location || '',
        observations: appointment.observations || ''
      });
    } else {
      // Reset form for new appointment
      setSelectedDate(undefined);
      setFormData({
        client_id: '',
        service_id: '',
        appointment_time: '',
        duration: 60,
        price: 0,
        status: 'pending',
        payment_status: 'pending',
        location: '',
        observations: ''
      });
    }
  }, [appointment]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !formData.client_id || !formData.service_id || !formData.appointment_time) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.price < 0) {
      toast.error('Preço não pode ser negativo');
      return;
    }

    try {
      const appointmentData = {
        ...formData,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      };

      if (appointment) {
        await updateAppointment.mutateAsync({
          id: appointment.id,
          ...appointmentData
        });
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        await createAppointment.mutateAsync(appointmentData);
        toast.success('Agendamento criado com sucesso!');
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('Erro ao salvar agendamento');
    }
  };

  return (
    <Card className="w-full max-w-2xl bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="client" className="text-sm font-medium">Cliente *</Label>
            <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {clientOptions.map((client) => (
                  <SelectItem key={client.id} value={client.id} className="hover:bg-accent">
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Serviço */}
          <div className="space-y-2">
            <Label htmlFor="service" className="text-sm font-medium">Serviço *</Label>
            <Select value={formData.service_id} onValueChange={handleServiceChange}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {serviceOptions.map((service) => (
                  <SelectItem key={service.id} value={service.id} className="hover:bg-accent">
                    {service.name} - R$ {service.price.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background border-border",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-sm font-medium">Horário *</Label>
            <Select value={formData.appointment_time} onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_time: value }))}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {availableSlots.map((slot) => (
                  <SelectItem key={slot} value={slot} className="hover:bg-accent">
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duração e Preço */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium">Duração (min)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                className="bg-background border-border"
                min="15"
                step="15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="bg-background border-border"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="pending" className="hover:bg-accent">Pendente</SelectItem>
                  <SelectItem value="confirmed" className="hover:bg-accent">Confirmado</SelectItem>
                  <SelectItem value="completed" className="hover:bg-accent">Concluído</SelectItem>
                  <SelectItem value="cancelled" className="hover:bg-accent">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_status" className="text-sm font-medium">Pagamento</Label>
              <Select value={formData.payment_status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, payment_status: value }))}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="pending" className="hover:bg-accent">Pendente</SelectItem>
                  <SelectItem value="partial" className="hover:bg-accent">Parcial</SelectItem>
                  <SelectItem value="paid" className="hover:bg-accent">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Local */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">Local</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Local do atendimento"
              className="bg-background border-border"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observations" className="text-sm font-medium">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Observações adicionais..."
              className="bg-background border-border"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={createAppointment.isPending || updateAppointment.isPending}
            >
              {createAppointment.isPending || updateAppointment.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};