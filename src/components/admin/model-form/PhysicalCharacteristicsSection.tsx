
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ModelFormData } from '../ModelForm';
import IntegratedCustomFields from './IntegratedCustomFields';

interface PhysicalCharacteristicsSectionProps {
  form: UseFormReturn<ModelFormData>;
}

const PhysicalCharacteristicsSection = ({ form }: PhysicalCharacteristicsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
        Características Físicas
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Campos do sistema */}
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Altura</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: 1.70" className="bg-zinc-800 border-zinc-700 text-white" />
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
                <Input {...field} placeholder="Ex: 60kg" className="bg-zinc-800 border-zinc-700 text-white" />
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione a cor dos olhos" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="castanhos" className="text-white">Castanhos</SelectItem>
                  <SelectItem value="verdes" className="text-white">Verdes</SelectItem>
                  <SelectItem value="azuis" className="text-white">Azuis</SelectItem>
                  <SelectItem value="pretos" className="text-white">Pretos</SelectItem>
                  <SelectItem value="mel" className="text-white">Mel</SelectItem>
                </SelectContent>
              </Select>
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
                <Input {...field} placeholder="Ex: P, M, G" className="bg-zinc-800 border-zinc-700 text-white" />
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
                <Input {...field} placeholder="Ex: 37" className="bg-zinc-800 border-zinc-700 text-white" />
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
                <Input {...field} placeholder="Ex: 90cm" className="bg-zinc-800 border-zinc-700 text-white" />
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
                <Input {...field} placeholder="Ex: 65cm" className="bg-zinc-800 border-zinc-700 text-white" />
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
                <Input {...field} placeholder="Ex: 95cm" className="bg-zinc-800 border-zinc-700 text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="silicone"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-700 p-4">
              <FormLabel className="text-white">Silicone</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campos personalizados integrados */}
        <IntegratedCustomFields form={form} sectionName="Características Físicas" />
      </div>
    </div>
  );
};

export default PhysicalCharacteristicsSection;
