import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeSlot[];
}

interface WorkingHours {
  [key: string]: DaySchedule;
}

const ModelWorkingHours = () => {
  const daysOfWeek = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    daysOfWeek.reduce((acc, day) => ({
      ...acc,
      [day.key]: {
        enabled: false,
        timeSlots: []
      }
    }), {})
  );

  const toggleDay = (dayKey: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey].enabled,
        timeSlots: !prev[dayKey].enabled ? [{ id: Date.now().toString(), startTime: '09:00', endTime: '18:00' }] : []
      }
    }));
  };

  const addTimeSlot = (dayKey: string) => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: '09:00',
      endTime: '18:00'
    };

    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        timeSlots: [...prev[dayKey].timeSlots, newSlot]
      }
    }));
  };

  const removeTimeSlot = (dayKey: string, slotId: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        timeSlots: prev[dayKey].timeSlots.filter(slot => slot.id !== slotId)
      }
    }));
  };

  const updateTimeSlot = (dayKey: string, slotId: string, field: 'startTime' | 'endTime', value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        timeSlots: prev[dayKey].timeSlots.map(slot =>
          slot.id === slotId ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const validateTimeSlot = (startTime: string, endTime: string): boolean => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return start < end;
  };

  const saveWorkingHours = () => {
    // Validar todos os horários
    let hasErrors = false;
    
    Object.entries(workingHours).forEach(([dayKey, schedule]) => {
      if (schedule.enabled) {
        schedule.timeSlots.forEach(slot => {
          if (!validateTimeSlot(slot.startTime, slot.endTime)) {
            hasErrors = true;
            toast({
              title: "Erro de validação",
              description: `Horário inválido em ${daysOfWeek.find(d => d.key === dayKey)?.label}`,
              variant: "destructive"
            });
          }
        });
      }
    });

    if (!hasErrors) {
      // Aqui você salvaria no banco de dados
      toast({
        title: "Sucesso",
        description: "Horários de atendimento salvos com sucesso!",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Horários de Atendimento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {daysOfWeek.map(day => (
          <div key={day.key} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Switch
                  checked={workingHours[day.key].enabled}
                  onCheckedChange={() => toggleDay(day.key)}
                />
                <Label className="font-medium">{day.label}</Label>
              </div>
              {workingHours[day.key].enabled && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addTimeSlot(day.key)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Horário
                </Button>
              )}
            </div>

            {workingHours[day.key].enabled && (
              <div className="space-y-3">
                {workingHours[day.key].timeSlots.map(slot => (
                  <div key={slot.id} className="flex items-center gap-3 p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">De:</Label>
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(day.key, slot.id, 'startTime', e.target.value)}
                          className="w-auto"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Até:</Label>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(day.key, slot.id, 'endTime', e.target.value)}
                          className="w-auto"
                        />
                      </div>
                    </div>
                    {workingHours[day.key].timeSlots.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeTimeSlot(day.key, slot.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <Button onClick={saveWorkingHours}>
            Salvar Horários
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelWorkingHours;