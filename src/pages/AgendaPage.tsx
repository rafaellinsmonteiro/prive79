import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CalendarDays } from 'lucide-react';
import { format, isSameDay, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  
  // Mock data - posteriormente virá do banco de dados
  const appointments: Appointment[] = [
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
  ];

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
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
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
              className="rounded-md border-0"
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
                        className={`text-xs ${
                          isBooked 
                            ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
                            : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'
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