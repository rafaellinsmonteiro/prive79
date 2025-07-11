import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAdminAppointments } from '@/hooks/useAdminAppointments';
import { useAdminModels } from '@/hooks/useAdminModels';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';

interface AdminAppointmentFormProps {
  onClose: () => void;
}

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export const AdminAppointmentForm = ({ onClose }: AdminAppointmentFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [currency, setCurrency] = useState<'BRL' | 'PRIV'>('BRL');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [observations, setObservations] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [hasRecurrence, setHasRecurrence] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date>();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  const { data: models = [] } = useAdminModels();
  const { createAppointment } = useAdminAppointments();

  // Carregar clientes quando uma modelo for selecionada
  useEffect(() => {
    if (selectedModel) {
      setLoadingClients(true);
      supabase
        .from('clients')
        .select('*')
        .eq('model_id', selectedModel)
        .eq('is_active', true)
        .then(({ data, error }) => {
          if (error) {
            console.error('Error loading clients:', error);
          } else {
            setClients(data || []);
          }
          setLoadingClients(false);
        });

      setLoadingServices(true);
      supabase
        .from('services')
        .select('*')
        .eq('model_id', selectedModel)
        .eq('is_active', true)
        .then(({ data, error }) => {
          if (error) {
            console.error('Error loading services:', error);
          } else {
            setServices(data || []);
          }
          setLoadingServices(false);
        });
    }
  }, [selectedModel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedModel || !selectedClient || !time) {
      return;
    }

    let finalPrice = 0;
    let finalDuration = 60;
    let finalServiceId = selectedService === "none" ? undefined : selectedService;

    // Se um serviço foi selecionado, usar os dados do serviço
    if (selectedService && selectedService !== "none") {
      const selectedServiceData = services.find(s => s.id === selectedService);
      if (selectedServiceData) {
        finalPrice = selectedServiceData.price;
        finalDuration = selectedServiceData.duration;
      }
    }

    // Se um valor customizado foi inserido, sobrescrever o preço
    if (customValue && parseFloat(customValue) > 0) {
      finalPrice = parseFloat(customValue);
    }

    const appointmentData = {
      model_id: selectedModel,
      client_id: selectedClient,
      service_id: finalServiceId || undefined,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      appointment_time: time,
      duration: finalDuration,
      price: finalPrice,
      currency,
      location: location || undefined,
      observations: observations || undefined,
      admin_notes: adminNotes || undefined,
      recurrence_type: hasRecurrence ? recurrenceType : 'none' as const,
      recurrence_end_date: hasRecurrence && recurrenceEndDate ? format(recurrenceEndDate, 'yyyy-MM-dd') : undefined,
    };

    try {
      await createAppointment.mutateAsync(appointmentData);
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Novo Agendamento</h2>
          <p className="text-zinc-400">Criar agendamento para modelo específica</p>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Informações do Agendamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seleção da Modelo */}
              <div className="space-y-2">
                <Label htmlFor="model" className="text-white">Modelo</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione uma modelo" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="text-white">
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label className="text-white">Data do Agendamento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 text-white",
                        !selectedDate && "text-zinc-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="pointer-events-auto"
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Cliente */}
              <div className="space-y-2">
                <Label htmlFor="client" className="text-white">Cliente</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient} disabled={!selectedModel}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder={loadingClients ? "Carregando..." : "Selecione um cliente"} />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id} className="text-white">
                        {client.name} {client.phone && `(${client.phone})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Horário */}
              <div className="space-y-2">
                <Label htmlFor="time" className="text-white">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              {/* Serviço */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="service" className="text-white">Serviço (opcional)</Label>
                <Select value={selectedService} onValueChange={setSelectedService} disabled={!selectedModel}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder={loadingServices ? "Carregando..." : "Selecione um serviço (opcional)"} />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="none" className="text-white">Nenhum serviço</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id} className="text-white">
                        {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Valor e Moeda Customizados */}
              <div className="space-y-2">
                <Label htmlFor="customValue" className="text-white">Valor Customizado (opcional)</Label>
                <Input
                  id="customValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="Digite o valor"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-white">Moeda</Label>
                <Select value={currency} onValueChange={(value: 'BRL' | 'PRIV') => setCurrency(value)}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="BRL" className="text-white">R$ (Real Brasileiro)</SelectItem>
                    <SelectItem value="PRIV" className="text-white">P$ (PrivaBank)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Local */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location" className="text-white">Local (opcional)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Endereço ou local do atendimento"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              {/* Observações */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observations" className="text-white">Observações (opcional)</Label>
                <Textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Observações gerais sobre o agendamento"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              {/* Notas do Admin */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="adminNotes" className="text-white">Notas Administrativas (opcional)</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notas internas para a administração"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              {/* Recorrência */}
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurrence"
                    checked={hasRecurrence}
                    onCheckedChange={(checked) => setHasRecurrence(checked as boolean)}
                  />
                  <Label htmlFor="recurrence" className="text-white">
                    Agendamento recorrente
                  </Label>
                </div>

                {hasRecurrence && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label className="text-white">Tipo de Recorrência</Label>
                      <Select value={recurrenceType} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setRecurrenceType(value)}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="daily" className="text-white">Diário</SelectItem>
                          <SelectItem value="weekly" className="text-white">Semanal</SelectItem>
                          <SelectItem value="monthly" className="text-white">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Data Final da Recorrência</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 text-white",
                              !recurrenceEndDate && "text-zinc-400"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {recurrenceEndDate ? format(recurrenceEndDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                          <Calendar
                            mode="single"
                            selected={recurrenceEndDate}
                            onSelect={setRecurrenceEndDate}
                            className="pointer-events-auto"
                            disabled={(date) => !selectedDate || date <= selectedDate}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createAppointment.isPending || !selectedDate || !selectedModel || !selectedClient || !time}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {createAppointment.isPending ? 'Criando...' : 'Criar Agendamento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};