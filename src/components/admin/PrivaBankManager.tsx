import { useState } from 'react';
import { Plus, Wallet, TrendingUp, Users, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePrivaBankAccounts } from '@/hooks/usePrivaBank';
import PrivaBankAccountForm from './PrivaBankAccountForm';
import PrivaBankAccountsList from './PrivaBankAccountsList';
import PrivaBankLogs from './PrivaBankLogs';

const PrivaBankManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  
  const { data: accounts = [], isLoading } = usePrivaBankAccounts();

  // Filtrar contas por nome ou email
  const filteredAccounts = accounts.filter(account => 
    account.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(acc => acc.is_active).length;
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  const handleEdit = (accountId: string) => {
    setEditingAccountId(accountId);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingAccountId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">PriveBank - Sistema Bancário</h2>
          <p className="text-zinc-400">Gerencie contas e transações da moeda virtual P$ (P-Coin)</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAccountId ? 'Editar Conta PriveBank' : 'Nova Conta PriveBank'}
              </DialogTitle>
            </DialogHeader>
            <PrivaBankAccountForm
              accountId={editingAccountId}
              onSuccess={handleCloseForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Total de Contas</CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalAccounts}</div>
            <p className="text-xs text-zinc-400">
              {activeAccounts} ativas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              P$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-zinc-400">
              Em todas as contas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-300">Contas Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeAccounts}</div>
            <p className="text-xs text-zinc-400">
              {totalAccounts > 0 ? Math.round((activeAccounts / totalAccounts) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="bg-zinc-800 border-zinc-700">
          <TabsTrigger value="accounts">Contas</TabsTrigger>
          <TabsTrigger value="new">Nova Conta</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          {/* Filtros */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Contas */}
          <PrivaBankAccountsList
            accounts={filteredAccounts}
            loading={isLoading}
            onEdit={handleEdit}
          />
        </TabsContent>

        <TabsContent value="new">
          <PrivaBankAccountForm
            accountId={editingAccountId}
            onSuccess={handleCloseForm}
          />
        </TabsContent>

        <TabsContent value="logs">
          <PrivaBankLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrivaBankManager;