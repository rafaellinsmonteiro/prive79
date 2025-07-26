import React, { useState } from 'react';
import { Search, User, Mail, CheckCircle, UserPlus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCreatePrivaBankAccount, useUpdatePrivaBankAccount } from '@/hooks/usePrivaBank';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SystemUser {
  id: string;
  user_id: string;
  name: string | null;
  email: string;
  user_role: string;
  is_active: boolean;
  account?: {
    id: string;
    balance: number;
    is_active: boolean;
  } | null;
}

const UserSearchActivateBank = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activatingUserId, setActivatingUserId] = useState<string | null>(null);

  const createAccount = useCreatePrivaBankAccount();
  const updateAccount = useUpdatePrivaBankAccount();

  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      toast.error('Digite um termo de busca');
      return;
    }

    setIsSearching(true);
    try {
      // Buscar usuários
      const { data: usersData, error: usersError } = await supabase
        .from('system_users')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .order('name');

      if (usersError) throw usersError;

      // Para cada usuário, verificar se tem conta PriveBank
      const usersWithAccounts = await Promise.all(
        (usersData || []).map(async (user) => {
          const { data: account } = await supabase
            .from('privabank_accounts')
            .select('id, balance, is_active')
            .eq('user_id', user.user_id)
            .maybeSingle();

          return {
            ...user,
            account: account || null
          };
        })
      );

      setUsers(usersWithAccounts);
      
      if (usersWithAccounts.length === 0) {
        toast.info('Nenhum usuário encontrado');
      } else {
        toast.success(`${usersWithAccounts.length} usuário(s) encontrado(s)`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Erro ao buscar usuários');
    } finally {
      setIsSearching(false);
    }
  };

  const activateUserBank = async (user: SystemUser) => {
    setActivatingUserId(user.user_id);

    try {
      if (user.account) {
        // Ativar conta existente
        await updateAccount.mutateAsync({
          id: user.account.id,
          is_active: true,
        });
        toast.success(`Conta PriveBank de ${user.name || user.email} ativada!`);
      } else {
        // Criar nova conta
        await createAccount.mutateAsync({
          user_id: user.user_id,
          initial_balance: 0,
        });
        toast.success(`Conta PriveBank criada para ${user.name || user.email}!`);
      }

      // Atualizar lista local
      setUsers(users.map(u => 
        u.user_id === user.user_id 
          ? { ...u, account: { ...u.account, is_active: true } as any }
          : u
      ));

    } catch (error) {
      console.error('Activation error:', error);
      toast.error('Erro ao ativar conta PriveBank');
    } finally {
      setActivatingUserId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchUsers();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <UserPlus className="h-4 w-4 mr-2" />
          Ativar PriveBank para Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Buscar e Ativar PriveBank para Usuários</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email do usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={searchUsers} 
              disabled={isSearching}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Results */}
          {users.length > 0 && (
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status PriveBank</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{user.name || 'Sem nome'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="max-w-48 truncate">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.user_role === 'admin' ? 'destructive' : 'secondary'}>
                          {user.user_role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.account ? (
                          <Badge variant={user.account.is_active ? 'default' : 'destructive'}>
                            {user.account.is_active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Não possui</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.account ? (
                          <span className="text-green-600 font-medium">
                            P$ {Number(user.account.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {!user.account || !user.account.is_active ? (
                          <Button
                            size="sm"
                            onClick={() => activateUserBank(user)}
                            disabled={activatingUserId === user.user_id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {activatingUserId === user.user_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {user.account ? 'Ativar' : 'Criar & Ativar'}
                              </>
                            )}
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Ativa</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {users.length === 0 && searchTerm && !isSearching && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
              <p className="text-sm">Tente buscar por nome ou email</p>
            </div>
          )}

          {!searchTerm && (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Digite um nome ou email para buscar usuários</p>
              <p className="text-sm">Você pode ativar o PriveBank para qualquer usuário ativo</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSearchActivateBank;