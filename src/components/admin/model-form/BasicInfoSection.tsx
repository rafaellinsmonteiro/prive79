
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Nome *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Nome da modelo"
                />
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
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Idade"
                  min="18"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Cidade</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione uma cidade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="neighborhood"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Bairro</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Bairro onde atende"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="whatsapp_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">WhatsApp</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Número do WhatsApp"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campos personalizados integrados para a seção Informações Básicas */}
        <IntegratedCustomFields form={form} sectionName="Informações Básicas" />
      </div>
    </div>
  );
};

export default BasicInfoSection;
