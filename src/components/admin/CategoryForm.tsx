
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Category } from '@/hooks/useCategories';
import { useEffect } from 'react';

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  display_order: z.number().min(0, 'Ordem deve ser >= 0').default(0),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const CategoryForm = ({ category, onSubmit, onCancel, isLoading }: CategoryFormProps) => {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      display_order: category?.display_order || 0,
    }
  });

  useEffect(() => {
    form.reset({
        name: category?.name || '',
        display_order: category?.display_order || 0,
    });
  }, [category, form]);

  const handleSubmit = (data: CategoryFormData) => {
    onSubmit({ ...data, display_order: Number(data.display_order) });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Nome da Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Loiras" {...field} className="bg-zinc-800 border-zinc-700 text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="display_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Ordem de Exibição</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} className="bg-zinc-800 border-zinc-700 text-white" />
              </FormControl>
              <FormMessage />
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
