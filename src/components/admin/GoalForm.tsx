import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useCreateGoal, useUpdateGoal, Goal } from '@/hooks/useGoals';
import { useAdminModels } from '@/hooks/useAdminModels';

interface GoalFormProps {
  goal?: Goal | null;
  onClose: () => void;
}

interface GoalFormData {
  model_id: string;
  admin_defined: boolean;
  goal_type: 'work_hours' | 'appointments' | 'points' | 'platform_access' | 'content_delivery' | 'live_minutes';
  title: string;
  description: string;
  target_value: number;
  period_type: 'daily' | 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  appointment_types: string[];
  content_formats: string[];
  reward_points: number;
  reward_description: string;
  is_active: boolean;
}

const GoalForm = ({ goal, onClose }: GoalFormProps) => {
  const [selectedAppointmentTypes, setSelectedAppointmentTypes] = useState<string[]>([]);
  const [selectedContentFormats, setSelectedContentFormats] = useState<string[]>([]);
  
  const { data: models = [] } = useAdminModels();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<GoalFormData>({
    defaultValues: {
      admin_defined: true,
      goal_type: 'work_hours',
      period_type: 'monthly',
      is_active: true,
      target_value: 0,
      reward_points: 0,
    }
  });

  const goalType = watch('goal_type');

  useEffect(() => {
    if (goal) {
      reset({
        model_id: goal.model_id || '',
        admin_defined: goal.admin_defined,
        goal_type: goal.goal_type,
        title: goal.title,
        description: goal.description || '',
        target_value: goal.target_value,
        period_type: goal.period_type,
        period_start: goal.period_start || '',
        period_end: goal.period_end || '',
        reward_points: goal.reward_points || 0,
        reward_description: goal.reward_description || '',
        is_active: goal.is_active,
      });
      setSelectedAppointmentTypes(goal.appointment_types || []);
      setSelectedContentFormats(goal.content_formats || []);
    }
  }, [goal, reset]);

  const onSubmit = async (data: GoalFormData) => {
    try {
      const goalData = {
        ...data,
        appointment_types: selectedAppointmentTypes.length > 0 ? selectedAppointmentTypes : null,
        content_formats: selectedContentFormats.length > 0 ? selectedContentFormats : null,
        model_id: data.model_id && data.model_id !== 'all' ? data.model_id : null,
        created_by_user_id: null, // Will be set by the server
      };

      if (goal) {
        await updateGoal.mutateAsync({ id: goal.id, ...goalData });
      } else {
        await createGoal.mutateAsync(goalData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const goalTypes = [
    { value: 'work_hours', label: 'Horas Trabalhadas' },
    { value: 'appointments', label: 'Agendamentos' },
    { value: 'points', label: 'Pontuação' },
    { value: 'platform_access', label: 'Acesso à Plataforma' },
    { value: 'content_delivery', label: 'Entrega de Conteúdo' },
    { value: 'live_minutes', label: 'Minutos de Live' },
  ];

  const periodTypes = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
  ];

  const appointmentTypeOptions = [
    'Encontro Casual',
    'Jantar',
    'Pernoite',
    'Videochamada',
    'Acompanhante',
    'Despedida de Solteiro',
  ];

  const contentFormatOptions = [
    'Fotos',
    'Vídeos',
    'Stories',
    'Lives',
    'Posts',
    'Reels',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-white">Título da Meta *</Label>
          <Input
            id="title"
            {...register('title', { required: 'Título é obrigatório' })}
            className="bg-zinc-800 border-zinc-700 text-white"
            placeholder="Ex: Meta de Agendamentos Mensais"
          />
          {errors.title && <span className="text-red-400 text-sm">{errors.title.message}</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal_type" className="text-white">Tipo de Meta *</Label>
          <Select onValueChange={(value) => setValue('goal_type', value as GoalFormData['goal_type'])} defaultValue={goalType}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {goalTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-white">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">Descrição</Label>
        <Textarea
          id="description"
          {...register('description')}
          className="bg-zinc-800 border-zinc-700 text-white"
          placeholder="Descreva os detalhes da meta..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="model_id" className="text-white">Modelo (Opcional)</Label>
          <Select onValueChange={(value) => setValue('model_id', value)}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Selecione um modelo específico" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="all">Todos os modelos</SelectItem>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id} className="text-white">
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target_value" className="text-white">Valor Alvo *</Label>
          <Input
            id="target_value"
            type="number"
            {...register('target_value', { 
              required: 'Valor alvo é obrigatório',
              min: { value: 1, message: 'Valor deve ser maior que 0' }
            })}
            className="bg-zinc-800 border-zinc-700 text-white"
            placeholder="Ex: 20"
          />
          {errors.target_value && <span className="text-red-400 text-sm">{errors.target_value.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="period_type" className="text-white">Período *</Label>
          <Select onValueChange={(value) => setValue('period_type', value as GoalFormData['period_type'])}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {periodTypes.map((period) => (
                <SelectItem key={period.value} value={period.value} className="text-white">
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="period_start" className="text-white">Data Início</Label>
          <Input
            id="period_start"
            type="date"
            {...register('period_start')}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="period_end" className="text-white">Data Fim</Label>
          <Input
            id="period_end"
            type="date"
            {...register('period_end')}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
      </div>

      {goalType === 'appointments' && (
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="pt-6">
            <Label className="text-white">Tipos de Agendamentos Específicos</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {appointmentTypeOptions.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`appointment-${type}`}
                    checked={selectedAppointmentTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAppointmentTypes([...selectedAppointmentTypes, type]);
                      } else {
                        setSelectedAppointmentTypes(selectedAppointmentTypes.filter(t => t !== type));
                      }
                    }}
                  />
                  <Label htmlFor={`appointment-${type}`} className="text-zinc-300 text-sm">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {goalType === 'content_delivery' && (
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="pt-6">
            <Label className="text-white">Formatos de Conteúdo</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {contentFormatOptions.map((format) => (
                <div key={format} className="flex items-center space-x-2">
                  <Checkbox
                    id={`content-${format}`}
                    checked={selectedContentFormats.includes(format)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedContentFormats([...selectedContentFormats, format]);
                      } else {
                        setSelectedContentFormats(selectedContentFormats.filter(f => f !== format));
                      }
                    }}
                  />
                  <Label htmlFor={`content-${format}`} className="text-zinc-300 text-sm">
                    {format}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reward_points" className="text-white">Pontos de Recompensa</Label>
          <Input
            id="reward_points"
            type="number"
            {...register('reward_points')}
            className="bg-zinc-800 border-zinc-700 text-white"
            placeholder="Ex: 100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reward_description" className="text-white">Descrição da Recompensa</Label>
          <Input
            id="reward_description"
            {...register('reward_description')}
            className="bg-zinc-800 border-zinc-700 text-white"
            placeholder="Ex: Bônus especial"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="admin_defined"
            {...register('admin_defined')}
          />
          <Label htmlFor="admin_defined" className="text-white">
            Meta definida pelo admin (não editável pelo modelo)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            {...register('is_active')}
          />
          <Label htmlFor="is_active" className="text-white">
            Meta ativa
          </Label>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-zinc-800">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={createGoal.isPending || updateGoal.isPending}
        >
          {createGoal.isPending || updateGoal.isPending ? 'Salvando...' : (goal ? 'Atualizar' : 'Criar')} Meta
        </Button>
      </div>
    </form>
  );
};

export default GoalForm;