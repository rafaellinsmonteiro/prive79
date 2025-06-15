
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { City } from '@/hooks/useCities';
import { useEffect } from 'react';

const citySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  state: z.string().min(2, 'UF é obrigatória').max(2, 'Use a sigla do estado (ex: SE)'),
  is_active: z.boolean().default(true),
});

type CityFormData = z.infer<typeof citySchema>;

interface CityFormProps {
  city?: City | null;
  onSubmit: (data: CityFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const CityForm = ({ city, onSubmit, onCancel, isLoading }: CityFormProps) => {
  const form = useForm<CityFormData>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      name: city?.name || '',
      state: city?.state || '',
      is_active: city?.is_active ?? true,
    }
  });
  
  useEffect(() => {
    form.reset({
      name: city?.name || '',
      state: city?.state || '',
      is_active: city?.is_active ?? true,
    })
  }, [city, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Nome da Cidade</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Aracaju" {...field} className="bg-zinc-800 border-zinc-700 text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">UF</FormLabel>
              <FormControl>
                <Input placeholder="Ex: SE" {...field} className="bg-zinc-800 border-zinc-700 text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 border-zinc-700">
              <div className="space-y-0.5">
                <FormLabel className="text-white">Ativa</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </form>
    </Form>
  )
}
