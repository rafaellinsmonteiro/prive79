
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ModelFormData } from '../ModelForm';

interface SettingsSectionProps {
  form: UseFormReturn<ModelFormData>;
}

const SettingsSection = ({ form }: SettingsSectionProps) => {
  const { register, setValue, watch } = form;
  const silicone = watch('silicone');
  const isActive = watch('is_active');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
        Configurações
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="silicone"
            checked={silicone}
            onCheckedChange={(checked) => setValue('silicone', checked)}
          />
          <Label htmlFor="silicone" className="text-white">Possui Silicone</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={isActive}
            onCheckedChange={(checked) => setValue('is_active', checked)}
          />
          <Label htmlFor="is_active" className="text-white">Perfil Ativo</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_order" className="text-white">Ordem de Exibição</Label>
        <Input
          id="display_order"
          type="number"
          {...register('display_order', { 
            valueAsNumber: true,
            min: { value: 0, message: 'Ordem deve ser maior ou igual a 0' }
          })}
          className="bg-zinc-800 border-zinc-700 text-white"
          placeholder="0"
        />
        <p className="text-zinc-400 text-sm">
          Quanto menor o número, mais acima aparecerá na lista
        </p>
      </div>
    </div>
  );
};

export default SettingsSection;
