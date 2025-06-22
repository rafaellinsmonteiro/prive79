
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ModelFormData } from '../ModelForm';
import { City } from '@/hooks/useCities';
import IntegratedCustomFields from './IntegratedCustomFields';

interface BasicInfoSectionProps {
  form: UseFormReturn<ModelFormData>;
  cities: City[];
}

const BasicInfoSection = ({ form, cities }: BasicInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
        Informações Básicas
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Apenas campos que NÃO são personalizáveis */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Nome *</FormLabel>
              <FormControl>
                <Input {...field} className="bg-zinc-800 border-zinc-700 text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Idade *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="bg-zinc-800 border-zinc-700 text-white" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campos personalizados integrados da seção "Informações Básicas" */}
        <IntegratedCustomFields form={form} sectionName="Informações Básicas" />
      </div>

      {/* Descrição - campo grande que fica em linha separada */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Descrição</FormLabel>
            <FormControl>
              <Textarea {...field} className="bg-zinc-800 border-zinc-700 text-white" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicInfoSection;
