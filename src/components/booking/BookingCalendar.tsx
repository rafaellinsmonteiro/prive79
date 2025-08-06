import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, addDays, isBefore, startOfDay, addHours, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BookingCalendarProps {
  onDateTimeSelect: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

export const BookingCalendar = ({ onDateTimeSelect, selectedDate, selectedTime }: BookingCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined
  );

  // Generate available time slots (9 AM to 8 PM)
  const allTimeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00"
  ];

  // Filter time slots based on current time + 1 hour minimum
  const availableTimeSlots = useMemo(() => {
    if (!date) return allTimeSlots;
    
    const now = new Date();
    const selectedDate = date;
    const isToday = isSameDay(now, selectedDate);
    
    if (!isToday) {
      // For future dates, all time slots are available
      return allTimeSlots;
    }
    
    // For today, only show slots that are at least 1 hour from now
    const oneHourFromNow = addHours(now, 1);
    const minimumTime = format(oneHourFromNow, "HH:mm");
    
    return allTimeSlots.filter(slot => slot >= minimumTime);
  }, [date]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      // Clear selected time when date changes
      if (selectedTime) {
        onDateTimeSelect(format(newDate, "yyyy-MM-dd"), "");
      }
    }
  };

  const handleTimeSelect = (time: string) => {
    if (date) {
      onDateTimeSelect(format(date, "yyyy-MM-dd"), time);
    }
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione Data e Horário</CardTitle>
        <CardDescription>
          Escolha o dia e horário para seu agendamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            locale={ptBR}
            className="rounded-md border"
          />
        </div>

        {date && (
          <div className="space-y-3">
            <div className="text-sm font-medium">
              Horários disponíveis para {format(date, "dd 'de' MMMM", { locale: ptBR })}:
            </div>
            {availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableTimeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeSelect(time)}
                    className={`text-xs ${
                      selectedTime === time 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground bg-muted/50 rounded-lg">
                <p className="text-sm">
                  Não há horários disponíveis para hoje com antecedência mínima de 1 hora.
                </p>
                <p className="text-xs mt-1">
                  Selecione uma data futura para ver os horários disponíveis.
                </p>
              </div>
            )}
          </div>
        )}

        {selectedDate && selectedTime && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Agendamento:</span>
              <Badge variant="secondary">
                {format(new Date(selectedDate), "dd/MM/yyyy")} às {selectedTime}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};