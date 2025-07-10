import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useCreatePrivaBankAccount, useUpdatePrivaBankAccount, usePrivaBankAccounts } from '@/hooks/usePrivaBank';
import { toast } from 'sonner';

const formSchema = z.object({
  user_id: z.string().min(1, 'Usuário é obrigatório'),
  balance: z.string().transform(val => parseFloat(val) || 0),
  is_active: z.boolean(),
});

interface PrivaBankAccountFormProps {
  accountId?: string | null;
  onSuccess: () => void;
}

const PrivaBankAccountForm = ({ accountId, onSuccess }: PrivaBankAccountFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: users = [] } = useAdminUsers();
  const { data: accounts = [] } = usePrivaBankAccounts();
  const createAccount = useCreatePrivaBankAccount();
  const updateAccount = useUpdatePrivaBankAccount();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: '',
      balance: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (accountId) {
      const account = accounts.find(acc => acc.id === accountId);
      if (account) {
        form.reset({
          user_id: account.user_id,
          balance: Number(account.balance),
          is_active: account.is_active,
        });
      }
    }
  }, [accountId, accounts, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      if (accountId) {
        await updateAccount.mutateAsync({
          id: accountId,
          balance: values.balance,
          is_active: values.is_active,
        });
        toast.success('Conta PriveBank atualizada com sucesso!');
      } else {
        // Verificar se o usuário já tem uma conta
        const existingAccount = accounts.find(acc => acc.user_id === values.user_id);
        if (existingAccount) {
          toast.error('Este usuário já possui uma conta PriveBank!');
          return;
        }

        await createAccount.mutateAsync({
          user_id: values.user_id,
          initial_balance: values.balance,
        });
        toast.success('Conta PriveBank criada com sucesso!');
      }
      
      onSuccess();
      form.reset();
    } catch (error) {
      console.error('Error managing PriveBank account:', error);
      toast.error('Erro ao gerenciar conta PriveBank');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar usuários que já não têm conta (exceto o usuário sendo editado)
  const availableUsers = users.filter(user => {
    if (accountId) {
      // Se estamos editando, mostrar o usuário atual
      const account = accounts.find(acc => acc.id === accountId);
      return user.user_id === account?.user_id || !accounts.some(acc => acc.user_id === user.user_id);
    }
    // Se estamos criando, mostrar apenas usuários sem conta
    return !accounts.some(acc => acc.user_id === user.user_id);
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="user_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Usuário</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!!accountId}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.user_id || ''}>
                      {user.name || user.email} ({user.user_role})
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
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Saldo Inicial (P$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                  value={field.value.toString()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-700 p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-white">Conta Ativa</FormLabel>
                <div className="text-sm text-zinc-400">
                  Permite que o usuário use o PriveBank
                </div>
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

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : accountId ? 'Atualizar' : 'Criar Conta'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PrivaBankAccountForm;