import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { City } from '@/hooks/useCities';
import { ModelFormData } from '../ModelForm';

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
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Nome *</Label>
          <Input
            id="name"
            {...form.register('name', { required: 'Nome é obrigatório' })}
            className="bg-zinc-800 border-zinc-700 text-white"
            placeholder="Nome da modelo"
          />
          {form.formState.errors.name && (
            <p className="text-red-400 text-sm">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age" className="text-white">Idade *</Label>
          <Input
            id="age"
            type="number"
            {...form.register('age', { 
              required: 'Idade é obrigatória',
              min: { value: 18, message: 'Idade mínima é 18 anos' },
              max: { value: 65, message: 'Idade máxima é 65 anos' }
            })}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          {form.formState.errors.age && (
            <p className="text-red-400 text-sm">{form.formState.errors.age.message}</p>
          )}
        </div>
        
        <FormField
          control={form.control}
          name="city_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Cidade</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione uma cidade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name} - {city.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="neighborhood" className="text-white">Bairro</Label>
          <Input
            id="neighborhood"
            {...form.register('neighborhood')}
            className="bg-zinc-800 border-zinc-700 text-white"
            placeholder="Ex: Jardins"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp_number" className="text-white">WhatsApp</Label>
          <Input
            id="whatsapp_number"
            {...form.register('whatsapp_number')}
            placeholder="5511999999999"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
