
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
        {/* Campo Cidade (fixo - não pode ser editado/excluído) */}
        <FormField
          control={form.control}
          name="city_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-medium">Cidade</FormLabel>
              <Select 
                value={field.value || ''} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione uma cidade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id} className="text-white hover:bg-zinc-700">
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Campos personalizados da seção "Informações Básicas" */}
        <IntegratedCustomFields form={form} sectionName="Informações Básicas" />
      </div>
    </div>
  );
};

export default BasicInfoSection;
