
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ModelFormData } from '../ModelForm';
import IntegratedCustomFields from './IntegratedCustomFields';

interface PhysicalCharacteristicsSectionProps {
  form: UseFormReturn<ModelFormData>;
}

const PhysicalCharacteristicsSection = ({ form }: PhysicalCharacteristicsSectionProps) => {
  const { setValue, watch } = form;
  const silicone = watch('silicone');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
        Características Físicas
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Altura</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ex: 1.65m"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Peso</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ex: 55kg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bust"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Busto</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ex: 90cm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="waist"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Cintura</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ex: 60cm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hip"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Quadril</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ex: 90cm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Manequim</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ex: 38, 40, 42"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eyes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Olhos</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ex: Castanhos, Azuis, Verdes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shoe_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Calçado</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ex: 37, 38, 39"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-2">
          <Switch
            id="silicone"
            checked={silicone}
            onCheckedChange={(checked) => setValue('silicone', checked)}
          />
          <Label htmlFor="silicone" className="text-white">Possui Silicone</Label>
        </div>

        {/* Campos personalizados integrados para a seção Características Físicas */}
        <IntegratedCustomFields form={form} sectionName="Características Físicas" />
      </div>
    </div>
  );
};

export default PhysicalCharacteristicsSection;
