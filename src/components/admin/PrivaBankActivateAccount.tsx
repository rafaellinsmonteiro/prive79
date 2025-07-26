import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Search, User, Mail, CreditCard, CheckCircle } from 'lucide-react';
import { useCreatePrivaBankAccount, useUpdatePrivaBankAccount } from '@/hooks/usePrivaBank';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const searchSchema = z.object({
  email: z.string().email('Email inválido'),
});

interface UserWithAccount {
  id: string;
  user_id: string;
  name: string | null;
  email: string;
  user_role: string;
  is_active: boolean;
  plan_id: string | null;
  account?: {
    id: string;
    balance: number;
    is_active: boolean;
    created_at: string;
  } | null;
}

const PrivaBankActivateAccount = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<UserWithAccount | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  const createAccount = useCreatePrivaBankAccount();
  const updateAccount = useUpdatePrivaBankAccount();

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      email: '',
    },
  });

  const searchUser = async (values: z.infer<typeof searchSchema>) => {
    setIsSearching(true);
    setFoundUser(null);

    try {
      // Buscar usuário pelo email
      const { data: user, error: userError } = await supabase
        .from('system_users')
        .select('*')
        .eq('email', values.email)
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          toast.error('Usuário não encontrado com este email');
        } else {
          toast.error('Erro ao buscar usuário');
        }
        return;
      }

      // Buscar conta PriveBank se existir
      const { data: account, error: accountError } = await supabase
        .from('privabank_accounts')
        .select('*')
        .eq('user_id', user.user_id)
        .maybeSingle();

      if (accountError && accountError.code !== 'PGRST116') {
        console.error('Error fetching account:', accountError);
        toast.error('Erro ao verificar conta PriveBank');
        return;
      }

      setFoundUser({
        ...user,
        account: account || null
      });

      toast.success('Usuário encontrado!');
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Erro ao buscar usuário');
    } finally {
      setIsSearching(false);
    }
  };

  const activateAccount = async () => {
    if (!foundUser) return;

    setIsActivating(true);

    try {
      if (foundUser.account) {
        // Ativar conta existente
        await updateAccount.mutateAsync({
          id: foundUser.account.id,
          is_active: true,
        });
        toast.success('Conta PriveBank ativada com sucesso!');
      } else {
        // Criar nova conta
        await createAccount.mutateAsync({
          user_id: foundUser.user_id,
          initial_balance: 0,
        });
        toast.success('Conta PriveBank criada e ativada com sucesso!');
      }

      // Atualizar dados do usuário encontrado
      const { data: account } = await supabase
        .from('privabank_accounts')
        .select('*')
        .eq('user_id', foundUser.user_id)
        .single();

      setFoundUser({
        ...foundUser,
        account: account || null
      });

    } catch (error) {
      console.error('Activation error:', error);
      toast.error('Erro ao ativar conta PriveBank');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="h-5 w-5" />
            Ativar Conta PriveBank por Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(searchUser)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email do Usuário</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Digite o email do usuário..."
                          {...field}
                          className="flex-1"
                        />
                      </FormControl>
                      <Button type="submit" disabled={isSearching}>
                        {isSearching ? 'Buscando...' : 'Buscar'}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {foundUser && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Usuário Encontrado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-300">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Nome:</span>
                  <span>{foundUser.name || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">Email:</span>
                  <span>{foundUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="font-medium">Tipo:</span>
                  <Badge variant={foundUser.user_role === 'admin' ? 'destructive' : 'secondary'}>
                    {foundUser.user_role}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="font-medium">Status:</span>
                  <Badge variant={foundUser.is_active ? 'default' : 'destructive'}>
                    {foundUser.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-300">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-medium">Conta PriveBank:</span>
                  {foundUser.account ? (
                    <Badge variant={foundUser.account.is_active ? 'default' : 'destructive'}>
                      {foundUser.account.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Não possui</Badge>
                  )}
                </div>
                
                {foundUser.account && (
                  <>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="font-medium">Saldo:</span>
                      <span>P$ {Number(foundUser.account.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="font-medium">Criada em:</span>
                      <span>{new Date(foundUser.account.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-700">
              {!foundUser.account || !foundUser.account.is_active ? (
                <Button 
                  onClick={activateAccount}
                  disabled={isActivating || !foundUser.is_active}
                  className="w-full"
                >
                  {isActivating ? 'Ativando...' : (
                    foundUser.account ? 'Ativar Conta PriveBank' : 'Criar e Ativar Conta PriveBank'
                  )}
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Conta PriveBank já está ativa!</span>
                </div>
              )}
              
              {!foundUser.is_active && (
                <p className="text-yellow-400 text-sm mt-2 text-center">
                  ⚠️ Usuário inativo - ative o usuário antes de ativar a conta PriveBank
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PrivaBankActivateAccount;