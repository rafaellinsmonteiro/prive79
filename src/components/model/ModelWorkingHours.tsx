import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentModel } from '@/hooks/useCurrentModel';

interface WorkingHour {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

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

const ModelWorkingHours = ({ trigger }: { trigger?: React.ReactNode }) => {
  const { data: modelProfile } = useCurrentModel();
  const model = modelProfile?.models;
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const daysOfWeek = [
    { key: 'monday', label: 'Segunda-feira', dayIndex: 1 },
    { key: 'tuesday', label: 'Terça-feira', dayIndex: 2 },
    { key: 'wednesday', label: 'Quarta-feira', dayIndex: 3 },
    { key: 'thursday', label: 'Quinta-feira', dayIndex: 4 },
    { key: 'friday', label: 'Sexta-feira', dayIndex: 5 },
    { key: 'saturday', label: 'Sábado', dayIndex: 6 },
    { key: 'sunday', label: 'Domingo', dayIndex: 0 }
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

  useEffect(() => {
    if (isOpen && model?.id) {
      loadWorkingHours();
    }
  }, [isOpen, model?.id]);

  const loadWorkingHours = async () => {
    if (!model?.id) return;
    
    setLoading(true);
    try {
      const { data: workingHoursData, error } = await supabase
        .from('model_working_hours')
        .select('*')
        .eq('model_id', model.id)
        .eq('is_active', true);

      if (error) throw error;

      // Convert database data to component state
      const newWorkingHours = { ...workingHours };
      
      workingHoursData?.forEach((hour: WorkingHour) => {
        const dayKey = daysOfWeek.find(d => d.dayIndex === hour.day_of_week)?.key;
        if (dayKey) {
          if (!newWorkingHours[dayKey].enabled) {
            newWorkingHours[dayKey] = {
              enabled: true,
              timeSlots: []
            };
          }
          
          newWorkingHours[dayKey].timeSlots.push({
            id: hour.id,
            startTime: hour.start_time,
            endTime: hour.end_time
          });
        }
      });

      setWorkingHours(newWorkingHours);
    } catch (error) {
      console.error('Error loading working hours:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar horários de atendimento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayKey: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey].enabled,
        timeSlots: !prev[dayKey].enabled ? [{ id: `new-${Date.now()}`, startTime: '09:00', endTime: '18:00' }] : []
      }
    }));
  };

  const addTimeSlot = (dayKey: string) => {
    const newSlot: TimeSlot = {
      id: `new-${Date.now()}`,
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

  const saveWorkingHours = async () => {
    if (!model?.id) return;

    // Validate all time slots
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

    if (hasErrors) return;

    setLoading(true);
    try {
      // First, delete existing working hours for this model
      await supabase
        .from('model_working_hours')
        .delete()
        .eq('model_id', model.id);

      // Then insert new working hours
      const hoursToInsert: any[] = [];
      
      Object.entries(workingHours).forEach(([dayKey, schedule]) => {
        if (schedule.enabled) {
          const dayIndex = daysOfWeek.find(d => d.key === dayKey)?.dayIndex;
          if (dayIndex !== undefined) {
            schedule.timeSlots.forEach(slot => {
              hoursToInsert.push({
                model_id: model.id,
                day_of_week: dayIndex,
                start_time: slot.startTime,
                end_time: slot.endTime,
                is_active: true
              });
            });
          }
        }
      });

      if (hoursToInsert.length > 0) {
        const { error } = await supabase
          .from('model_working_hours')
          .insert(hoursToInsert);

        if (error) throw error;
      }

      // Update model online status based on new working hours
      await supabase.rpc('update_model_online_status');

      toast({
        title: "Sucesso",
        description: "Horários de atendimento salvos com sucesso!",
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving working hours:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar horários de atendimento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Horários de Atendimento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horários de Atendimento
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
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

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={saveWorkingHours} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Horários'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModelWorkingHours;