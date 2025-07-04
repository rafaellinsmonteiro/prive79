import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Clock, CalendarDays } from 'lucide-react';
import { format, isSameDay, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  date: Date;
  time: string;
  duration: number;
  client: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  type: string;
}

const AgendaPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      date: new Date(),
      time: '14:00',
      duration: 60,
      client: 'Cliente A',
      status: 'confirmed',
      type: '1 hora'
    },
    {
      id: '2',
      date: new Date(),
      time: '16:00',
      duration: 120,
      client: 'Cliente B',
      status: 'pending',
      type: '2 horas'
    }
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    client: '',
    time: '',
    duration: '',
    type: ''
  });

  const availableSlots = [
    '10:00', '11:00', '12:00', '13:00', '15:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const getDayAppointments = (date: Date | undefined) => {
    if (!date) return [];
    return appointments.filter(apt => isSameDay(apt.date, date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleCreateAppointment = () => {
    if (!selectedDate || !newAppointment.client || !newAppointment.time || !newAppointment.duration) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const appointment: Appointment = {
      id: Date.now().toString(),
      date: selectedDate,
      time: newAppointment.time,
      duration: parseInt(newAppointment.duration),
      client: newAppointment.client,
      status: 'pending',
      type: newAppointment.type || `${newAppointment.duration} min`
    };

    setAppointments([...appointments, appointment]);
    setNewAppointment({ client: '', time: '', duration: '', type: '' });
    setIsDialogOpen(false);
    toast.success('Compromisso criado com sucesso!');
  };

  const handleTimeSlotClick = (time: string) => {
    setNewAppointment(prev => ({ ...prev, time }));
    setIsDialogOpen(true);
  };

  const dayAppointments = getDayAppointments(selectedDate);

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
              <h1 className="text-white font-semibold text-sm">Minha Agenda</h1>
              <p className="text-zinc-400 text-xs">Gerencie seus horários</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
              <DialogHeader>
                <DialogTitle>Novo Compromisso</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Input
                    id="client"
                    value={newAppointment.client}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, client: e.target.value }))}
                    placeholder="Nome do cliente"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Select value={newAppointment.time} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, time: value }))}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {availableSlots.filter(slot => !dayAppointments.some(apt => apt.time === slot)).map((slot) => (
                        <SelectItem key={slot} value={slot} className="text-white focus:bg-zinc-700">
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração</Label>
                  <Select value={newAppointment.duration} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, duration: value, type: value === '60' ? '1 hora' : value === '120' ? '2 horas' : value === '180' ? '3 horas' : `${value} min` }))}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Selecione a duração" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="60" className="text-white focus:bg-zinc-700">1 hora</SelectItem>
                      <SelectItem value="120" className="text-white focus:bg-zinc-700">2 horas</SelectItem>
                      <SelectItem value="180" className="text-white focus:bg-zinc-700">3 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateAppointment}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Criar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-4">
        <Card className="bg-zinc-900 border-zinc-800 mb-4">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border-0 text-white [&_button]:text-white [&_button:hover]:bg-zinc-700 [&_[aria-selected='true']]:bg-blue-600 [&_[aria-selected='true']]:text-white [&_.rdp-day_today]:bg-zinc-700 [&_.rdp-day_today]:text-white [&_.rdp-head_cell]:text-zinc-400"
              locale={ptBR}
            />
          </CardContent>
        </Card>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="mb-4">
            <h2 className="text-white font-semibold mb-2">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h2>
            
            {/* Appointments for selected date */}
            <Card className="bg-zinc-900 border-zinc-800 mb-4">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Compromissos Agendados ({dayAppointments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {dayAppointments.length === 0 ? (
                  <p className="text-zinc-400 text-sm">Nenhum compromisso agendado</p>
                ) : (
                  <div className="space-y-3">
                    {dayAppointments.map((apt) => (
                      <div 
                        key={apt.id}
                        className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(apt.status)}`} />
                          <div>
                            <p className="text-white font-medium text-sm">{apt.time}</p>
                            <p className="text-zinc-400 text-xs">{apt.client} • {apt.type}</p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="text-xs border-zinc-600 text-zinc-400"
                        >
                          {apt.status === 'confirmed' ? 'Confirmado' : 
                           apt.status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available slots */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-sm">Horários Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => {
                    const isBooked = dayAppointments.some(apt => apt.time === slot);
                    return (
                      <Button
                        key={slot}
                        variant={isBooked ? "secondary" : "outline"}
                        size="sm"
                        disabled={isBooked}
                        onClick={() => !isBooked && handleTimeSlotClick(slot)}
                        className={`text-xs ${
                          isBooked 
                            ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
                            : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800 cursor-pointer'
                        }`}
                      >
                        {slot}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaPage;