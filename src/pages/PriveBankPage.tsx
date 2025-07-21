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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import V2VipModel from '@/components/V2VipModel';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowRightLeft, 
  DollarSign, 
  Mail, 
  Hash, 
  Filter, 
  Calendar,
  TrendingUp,
  Eye,
  EyeOff,
  Copy,
  CreditCard,
  Banknote,
  Send,
  Receipt,
  Shield,
  Star
} from 'lucide-react';

const PriveBankPage = () => {
  const { user } = useAuth();
  const transferMutation = useTransferBetweenAccounts();
  const transferByIdMutation = useTransferByAccountId();
  const { toast } = useToast();
  
  // Estados para operações
  const [depositAmount, setDepositAmount] = useState('');
  const [depositCurrency, setDepositCurrency] = useState('PCoins');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('PCoins');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferCurrency, setTransferCurrency] = useState('PCoins');
  const [transferToEmail, setTransferToEmail] = useState('');
  const [transferToAccountId, setTransferToAccountId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para UI
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Filtros para transações
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all',
    currency: 'all'
  });

  const { account, transactions, isLoading } = usePrivaBank(filters);

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
      // Simular depósito (implementar conforme necessário)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      // Simular saque (implementar conforme necessário)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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

  const handleTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido para transferência",
        variant: "destructive"
      });
      return;
    }

    if (!transferToEmail.trim()) {
      toast({
        title: "Erro",
        description: "Digite o email do destinatário",
        variant: "destructive"
      });
      return;
    }

    const currentBalance = transferCurrency === 'PCoins' ? (account?.balance || 0) : (account?.balance_brl || 0);
    if (parseFloat(transferAmount) > currentBalance) {
      toast({
        title: "Erro",
        description: `Saldo insuficiente em ${transferCurrency === 'PCoins' ? 'P-Coins' : 'Reais'}`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await transferMutation.mutateAsync({
        fromAccountId: account!.id,
        toUserEmail: transferToEmail.trim(),
        amount: parseFloat(transferAmount),
        description: `Transferência via PriveBank`
      });
      
      setTransferAmount('');
      setTransferToEmail('');
      toast({
        title: "Sucesso",
        description: "Transferência realizada com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao realizar transferência",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "ID copiado para a área de transferência"
    });
  };

  if (isLoading) {
    return (
      <V2VipModel 
        title="PriveBank" 
        subtitle="Seu banco digital privado"
        activeId="privebank"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Carregando sua conta PriveBank...</p>
          </div>
        </div>
      </V2VipModel>
    );
  }

  if (!account || !account.is_active) {
    return (
      <V2VipModel 
        title="PriveBank" 
        subtitle="Seu banco digital privado"
        activeId="privebank"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto">
              <Wallet className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">PriveBank</h1>
              <p className="text-muted-foreground">
                Sua conta PriveBank ainda não foi ativada. Entre em contato com o suporte para ativação.
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Entrar em Contato
            </Button>
          </div>
        </div>
      </V2VipModel>
    );
  }

  const formatCurrency = (amount: number, currency: 'PCoins' | 'BRL') => {
    return currency === 'PCoins' 
      ? `P$ ${amount.toFixed(2)}`
      : `R$ ${amount.toFixed(2)}`;
  };

  return (
    <V2VipModel 
      title="PriveBank" 
      subtitle="Seu banco digital privado"
      activeId="privebank"
    >
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex justify-end">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Shield className="h-3 w-3 mr-1" />
            Conta Ativa
          </Badge>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* P-Coins Balance */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-blue-100 text-sm font-medium">P-Coins</p>
                  <div className="flex items-center gap-2">
                    {showBalance ? (
                      <p className="text-3xl font-bold">
                        P$ {Number(account.balance || 0).toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-3xl font-bold">P$ ••••••</p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                      className="h-6 w-6 p-0 text-blue-100 hover:text-white hover:bg-blue-400/20"
                    >
                      {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6" />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-400/10 rounded-full"></div>
            </CardContent>
          </Card>

          {/* BRL Balance */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-green-100 text-sm font-medium">Reais</p>
                  <div className="flex items-center gap-2">
                    {showBalance ? (
                      <p className="text-3xl font-bold">
                        R$ {Number(account.balance_brl || 0).toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-3xl font-bold">R$ ••••••</p>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                  <Banknote className="h-6 w-6" />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-400/10 rounded-full"></div>
            </CardContent>
          </Card>

          {/* Account ID */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-purple-100 text-sm font-medium">ID da Carteira</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono truncate">
                    {account.id.substring(0, 8)}...{account.id.substring(-4)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(account.id)}
                    className="h-6 w-6 p-0 text-purple-100 hover:text-white hover:bg-purple-400/20"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-purple-200">Clique para copiar o ID completo</p>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-400/10 rounded-full"></div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Operações
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ArrowDownLeft className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Depósito Rápido</h3>
                  <p className="text-sm text-muted-foreground mb-4">Adicione fundos à sua conta</p>
                  <Button 
                    onClick={() => setActiveTab('operations')}
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    Depositar
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ArrowUpRight className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Saque Rápido</h3>
                  <p className="text-sm text-muted-foreground mb-4">Retire seus fundos</p>
                  <Button 
                    onClick={() => setActiveTab('operations')}
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    Sacar
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Send className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Transferir</h3>
                  <p className="text-sm text-muted-foreground mb-4">Envie para outros usuários</p>
                  <Button 
                    onClick={() => setActiveTab('operations')}
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    Transferir
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Receipt className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Histórico</h3>
                  <p className="text-sm text-muted-foreground mb-4">Veja suas transações</p>
                  <Button 
                    onClick={() => setActiveTab('history')}
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    Ver Histórico
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Transações Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transaction.transaction_type === 'deposit' ? 'bg-green-100 text-green-600' :
                            transaction.transaction_type === 'withdraw' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {transaction.transaction_type === 'deposit' ? <ArrowDownLeft className="h-5 w-5" /> :
                             transaction.transaction_type === 'withdraw' ? <ArrowUpRight className="h-5 w-5" /> :
                             <ArrowRightLeft className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'deposit' ? '+' : '-'}
                            {formatCurrency(transaction.amount, transaction.currency as 'PCoins' | 'BRL')}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Depósito */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    <ArrowDownLeft className="h-5 w-5" />
                    Depósito
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="deposit-amount">Valor do Depósito</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deposit-currency">Moeda</Label>
                    <Select value={depositCurrency} onValueChange={setDepositCurrency}>
                      <SelectTrigger>
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <ArrowUpRight className="h-5 w-5" />
                    Saque
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="withdraw-amount">Valor do Saque</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="withdraw-currency">Moeda</Label>
                    <Select value={withdrawCurrency} onValueChange={setWithdrawCurrency}>
                      <SelectTrigger>
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600 flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Transferência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="transfer-amount">Valor</Label>
                    <Input
                      id="transfer-amount"
                      type="number"
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="transfer-email">Email do Destinatário</Label>
                    <Input
                      id="transfer-email"
                      type="email"
                      placeholder="destinatario@email.com"
                      value={transferToEmail}
                      onChange={(e) => setTransferToEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="transfer-currency">Moeda</Label>
                    <Select value={transferCurrency} onValueChange={setTransferCurrency}>
                      <SelectTrigger>
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
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? "Processando..." : "Transferir"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Histórico de Transações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            transaction.transaction_type === 'deposit' ? 'bg-green-100 text-green-600' :
                            transaction.transaction_type === 'withdraw' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {transaction.transaction_type === 'deposit' ? <ArrowDownLeft className="h-6 w-6" /> :
                             transaction.transaction_type === 'withdraw' ? <ArrowUpRight className="h-6 w-6" /> :
                             <ArrowRightLeft className="h-6 w-6" />}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString('pt-BR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${
                            transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'deposit' ? '+' : '-'}
                            {formatCurrency(transaction.amount, transaction.currency as 'PCoins' | 'BRL')}
                          </p>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma transação encontrada</h3>
                    <p className="text-muted-foreground">Suas transações aparecerão aqui quando você começar a usar o PriveBank.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </V2VipModel>
  );
};

export default PriveBankPage;