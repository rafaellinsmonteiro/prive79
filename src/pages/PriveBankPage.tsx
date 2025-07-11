import { useState } from 'react';
import { usePrivaBank, useTransferBetweenAccounts, useTransferByAccountId } from '@/hooks/usePrivaBank';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Wallet, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, DollarSign, Mail, Hash, Filter, Calendar } from 'lucide-react';

const PriveBankPage = () => {
  const { user } = useAuth();
  const transferMutation = useTransferBetweenAccounts();
  const transferByIdMutation = useTransferByAccountId();
  const { toast } = useToast();
  
  // Filtros para transações
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all',
    currency: 'all'
  });

  const { account, transactions, isLoading, createTransaction } = usePrivaBank(filters);
  
  const [depositAmount, setDepositAmount] = useState('');
  const [depositCurrency, setDepositCurrency] = useState('PCoins');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('PCoins');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferCurrency, setTransferCurrency] = useState('PCoins');
  const [transferToEmail, setTransferToEmail] = useState('');
  const [transferToAccountId, setTransferToAccountId] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido para depósito",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await createTransaction({
        transaction_type: 'deposit',
        amount: parseFloat(depositAmount),
        to_account_id: account?.id,
        currency: depositCurrency,
        description: `Depósito via PriveBank (${depositCurrency === 'PCoins' ? 'P$' : 'R$'})`
      });
      
      setDepositAmount('');
      toast({
        title: "Sucesso",
        description: "Depósito realizado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao realizar depósito",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido para saque",
        variant: "destructive"
      });
      return;
    }

    // Verificar saldo da moeda específica
    const currentBalance = withdrawCurrency === 'PCoins' ? (account?.balance || 0) : (account?.balance_brl || 0);
    if (parseFloat(withdrawAmount) > currentBalance) {
      toast({
        title: "Erro",
        description: `Saldo insuficiente em ${withdrawCurrency === 'PCoins' ? 'P-Coins' : 'Reais'}`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await createTransaction({
        transaction_type: 'withdraw',
        amount: parseFloat(withdrawAmount),
        from_account_id: account?.id,
        currency: withdrawCurrency,
        description: `Saque via PriveBank (${withdrawCurrency === 'PCoins' ? 'P$' : 'R$'})`
      });
      
      setWithdrawAmount('');
      toast({
        title: "Sucesso",
        description: "Saque realizado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao realizar saque",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransferById = async () => {
    console.log('🚀 Iniciando processo de transferência por ID...');
    console.log('📋 Dados da transferência:', {
      transferAmount,
      transferToAccountId,
      accountId: account?.id,
      accountBalance: account?.balance
    });

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      console.log('❌ Valor inválido para transferência');
      toast({
        title: "Erro",
        description: "Digite um valor válido para transferência",
        variant: "destructive"
      });
      return;
    }

    if (!transferToAccountId.trim()) {
      console.log('❌ ID da carteira destinatário vazio');
      toast({
        title: "Erro",
        description: "Digite o ID da carteira do destinatário",
        variant: "destructive"
      });
      return;
    }

    if (!account?.id) {
      console.log('❌ Conta PriveBank não encontrada');
      toast({
        title: "Erro",
        description: "Conta PriveBank não encontrada",
        variant: "destructive"
      });
      return;
    }

    const currentBalance = transferCurrency === 'PCoins' ? (account?.balance || 0) : (account?.balance_brl || 0);
    if (parseFloat(transferAmount) > currentBalance) {
      console.log('❌ Saldo insuficiente. Saldo:', currentBalance, 'Valor:', transferAmount, 'Moeda:', transferCurrency);
      toast({
        title: "Erro",
        description: `Saldo insuficiente em ${transferCurrency === 'PCoins' ? 'P-Coins' : 'Reais'}`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('🔄 Executando transferência por ID...');
      await transferByIdMutation.mutateAsync({
        fromAccountId: account!.id,
        toAccountId: transferToAccountId.trim(),
        amount: parseFloat(transferAmount),
        description: `Transferência sigilosa via ID da carteira`
      });
      
      console.log('✅ Transferência por ID realizada com sucesso!');
      setTransferAmount('');
      setTransferToAccountId('');
      toast({
        title: "Sucesso",
        description: "Transferência sigilosa realizada com sucesso"
      });
    } catch (error: any) {
      console.error('❌ Erro na transferência por ID:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao realizar transferência",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async () => {
    console.log('🚀 Iniciando processo de transferência...');
    console.log('📋 Dados da transferência:', {
      transferAmount,
      transferToEmail,
      accountId: account?.id,
      accountBalance: account?.balance
    });

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      console.log('❌ Valor inválido para transferência');
      toast({
        title: "Erro",
        description: "Digite um valor válido para transferência",
        variant: "destructive"
      });
      return;
    }

    if (!transferToEmail.trim()) {
      console.log('❌ Email destinatário vazio');
      toast({
        title: "Erro",
        description: "Digite o email do destinatário",
        variant: "destructive"
      });
      return;
    }

    if (!account?.id) {
      console.log('❌ Conta PriveBank não encontrada');
      toast({
        title: "Erro",
        description: "Conta PriveBank não encontrada",
        variant: "destructive"
      });
      return;
    }

    const currentBalance = transferCurrency === 'PCoins' ? (account?.balance || 0) : (account?.balance_brl || 0);
    if (parseFloat(transferAmount) > currentBalance) {
      console.log('❌ Saldo insuficiente. Saldo:', currentBalance, 'Valor:', transferAmount, 'Moeda:', transferCurrency);
      toast({
        title: "Erro",
        description: `Saldo insuficiente em ${transferCurrency === 'PCoins' ? 'P-Coins' : 'Reais'}`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('🔄 Executando transferência...');
      await transferMutation.mutateAsync({
        fromAccountId: account!.id,
        toUserEmail: transferToEmail.trim(),
        amount: parseFloat(transferAmount),
        description: `Transferência via PriveBank`
      });
      
      console.log('✅ Transferência realizada com sucesso!');
      setTransferAmount('');
      setTransferToEmail('');
      toast({
        title: "Sucesso",
        description: "Transferência realizada com sucesso"
      });
    } catch (error: any) {
      console.error('❌ Erro na transferência:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao realizar transferência",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Carregando sua conta PriveBank...</div>
      </div>
    );
  }

  if (!account || !account.is_active) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-zinc-400" />
            <h1 className="text-3xl font-bold mb-4">PriveBank</h1>
            <p className="text-zinc-400 text-lg mb-8">
              Sua conta PriveBank ainda não foi ativada. Entre em contato com o suporte para ativação.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Wallet className="h-8 w-8" />
            PriveBank
          </h1>
          <p className="text-zinc-400">Suas carteiras digitais - P$ (P-Coin) e R$ (Reais)</p>
        </div>

        {/* Saldos e ID da Carteira */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Saldo P-Coins</p>
                  <p className="text-3xl font-bold text-white">
                    P$ {Number(account.balance || 0).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Saldo Reais</p>
                  <p className="text-3xl font-bold text-white">
                    R$ {Number(account.balance_brl || 0).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gray-600 to-gray-700 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-100 text-sm">ID da Carteira</p>
                  <p className="text-sm font-mono text-white break-all">
                    {account.id}
                  </p>
                </div>
                <Hash className="h-8 w-8 text-gray-200 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="operations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
            <TabsTrigger value="operations" className="text-zinc-300 data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
              Operações
            </TabsTrigger>
            <TabsTrigger value="history" className="text-zinc-300 data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Depósito */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <ArrowDownLeft className="h-5 w-5" />
                    Depósito
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="deposit-amount" className="text-zinc-300">
                      Valor do Depósito
                    </Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deposit-currency" className="text-zinc-300">
                      Moeda
                    </Label>
                    <Select value={depositCurrency} onValueChange={setDepositCurrency}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PCoins">P$ (P-Coins)</SelectItem>
                        <SelectItem value="BRL">R$ (Reais)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleDeposit}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? "Processando..." : "Depositar"}
                  </Button>
                </CardContent>
              </Card>

              {/* Saque */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <ArrowUpRight className="h-5 w-5" />
                    Saque
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="withdraw-amount" className="text-zinc-300">
                      Valor do Saque
                    </Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="withdraw-currency" className="text-zinc-300">
                      Moeda
                    </Label>
                    <Select value={withdrawCurrency} onValueChange={setWithdrawCurrency}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PCoins">P$ (P-Coins)</SelectItem>
                        <SelectItem value="BRL">R$ (Reais)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleWithdraw}
                    disabled={isProcessing}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {isProcessing ? "Processando..." : "Sacar"}
                  </Button>
                </CardContent>
              </Card>

              {/* Transferência */}
              <Card className="bg-zinc-900 border-zinc-800 md:col-span-2 xl:col-span-1">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5" />
                    Transferência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="email" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                      <TabsTrigger value="email" className="text-zinc-300 data-[state=active]:bg-zinc-700 data-[state=active]:text-white flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Por Email
                      </TabsTrigger>
                      <TabsTrigger value="id" className="text-zinc-300 data-[state=active]:bg-zinc-700 data-[state=active]:text-white flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Sigiloso
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="email" className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="transfer-email" className="text-zinc-300">
                          Email do Destinatário
                        </Label>
                        <Input
                          id="transfer-email"
                          type="email"
                          placeholder="destinatario@email.com"
                          value={transferToEmail}
                          onChange={(e) => setTransferToEmail(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="transfer-amount-email" className="text-zinc-300">
                          Valor da Transferência
                        </Label>
                        <Input
                          id="transfer-amount-email"
                          type="number"
                          placeholder="0.00"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="transfer-currency" className="text-zinc-300">
                          Moeda
                        </Label>
                        <Select value={transferCurrency} onValueChange={setTransferCurrency}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PCoins">P$ (P-Coins)</SelectItem>
                            <SelectItem value="BRL">R$ (Reais)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleTransfer}
                        disabled={isProcessing || transferMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {(isProcessing || transferMutation.isPending) ? "Processando..." : "Transferir por Email"}
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="id" className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="transfer-account-id" className="text-zinc-300">
                          ID da Carteira Destinatário
                        </Label>
                        <Input
                          id="transfer-account-id"
                          type="text"
                          placeholder="ID da carteira (ex: b88235ee-62ad-43ef-973a-c88dcf847af3)"
                          value={transferToAccountId}
                          onChange={(e) => setTransferToAccountId(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="transfer-amount-id" className="text-zinc-300">
                          Valor da Transferência
                        </Label>
                        <Input
                          id="transfer-amount-id"
                          type="number"
                          placeholder="0.00"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        />
                      </div>
                      <Button 
                        onClick={handleTransferById}
                        disabled={isProcessing || transferByIdMutation.isPending}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {(isProcessing || transferByIdMutation.isPending) ? "Processando..." : "Transferir Sigilosamente"}
                      </Button>
                      <p className="text-zinc-500 text-xs">
                        🔒 Transferência totalmente anônima - apenas IDs das carteiras são usados
                      </p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {/* Filtros do Extrato */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros do Extrato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="start-date" className="text-zinc-300">Data Início</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="text-zinc-300">Data Fim</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transaction-type" className="text-zinc-300">Tipo</Label>
                    <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="deposit">Depósitos</SelectItem>
                        <SelectItem value="withdraw">Saques</SelectItem>
                        <SelectItem value="transfer">Transferências</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency-filter" className="text-zinc-300">Moeda</Label>
                    <Select value={filters.currency} onValueChange={(value) => setFilters(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="PCoins">P$ (P-Coins)</SelectItem>
                        <SelectItem value="BRL">R$ (Reais)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Transações */}
            {transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <Card key={transaction.id} className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {transaction.transaction_type === 'deposit' && (
                            <ArrowDownLeft className="h-5 w-5 text-green-400" />
                          )}
                          {transaction.transaction_type === 'withdraw' && (
                            <ArrowUpRight className="h-5 w-5 text-red-400" />
                          )}
                          {transaction.transaction_type === 'transfer' && (
                            <ArrowRightLeft className="h-5 w-5 text-blue-400" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium">
                                {transaction.transaction_type === 'deposit' && 'Depósito'}
                                {transaction.transaction_type === 'withdraw' && 'Saque'}
                                {transaction.transaction_type === 'transfer' && 'Transferência'}
                              </p>
                              <span className="text-xs px-2 py-1 rounded bg-zinc-700 text-zinc-300">
                                {transaction.currency === 'PCoins' ? 'P$' : 'R$'}
                              </span>
                            </div>
                            <p className="text-zinc-400 text-sm">
                              {new Date(transaction.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            transaction.transaction_type === 'deposit' || 
                            (transaction.transaction_type === 'transfer' && transaction.to_account_id === account?.id)
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            {(transaction.transaction_type === 'deposit' || 
                              (transaction.transaction_type === 'transfer' && transaction.to_account_id === account?.id)) ? '+' : '-'}
                            {transaction.currency === 'PCoins' ? 'P$' : 'R$'} {Number(transaction.amount).toFixed(2)}
                          </p>
                          <p className="text-zinc-500 text-sm">{transaction.status}</p>
                        </div>
                      </div>
                      {transaction.description && (
                        <p className="text-zinc-400 text-sm mt-2">{transaction.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-400">Nenhuma transação encontrada</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PriveBankPage;