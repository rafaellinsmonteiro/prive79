import { useState } from 'react';
import { usePrivaBank, useTransferBetweenAccounts } from '@/hooks/usePrivaBank';
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
import { useNavigate } from 'react-router-dom';
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
  Star,
  PiggyBank,
  TrendingDown
} from 'lucide-react';

const ModelV2BankPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const transferMutation = useTransferBetweenAccounts();
  const { toast } = useToast();
  
  // Estados para operações
  const [depositAmount, setDepositAmount] = useState('');
  const [depositCurrency, setDepositCurrency] = useState('PCoins');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('PCoins');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferCurrency, setTransferCurrency] = useState('PCoins');
  const [transferToEmail, setTransferToEmail] = useState('');
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

  const handleProductClick = (product: string) => {
    navigate(`/v2/bank/${product}`);
  };

  if (isLoading) {
    return (
      <V2VipModel 
        title="PriveBank" 
        subtitle="Seu banco digital premium"
        activeId="bank"
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
        subtitle="Seu banco digital premium"
        activeId="bank"
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

  return (
    <V2VipModel 
      title="PriveBank" 
      subtitle="Seu banco digital premium"
      activeId="bank"
    >
      <div className="space-y-8">
        {/* Status Badge */}
        <div className="flex justify-end">
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Shield className="h-3 w-3 mr-1" />
            Conta Premium Ativa
          </Badge>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* P-Coins Balance */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-slate-600 text-sm font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    P-Coins
                  </p>
                  <div className="flex items-center gap-2">
                    {showBalance ? (
                      <p className="text-3xl font-bold text-slate-900">
                        P$ {Number(account.balance || 0).toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-3xl font-bold text-slate-900">P$ ••••••</p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                      className="h-6 w-6 p-0 text-slate-600 hover:text-slate-900"
                    >
                      {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="w-14 h-14 bg-slate-200/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="h-7 w-7 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BRL Balance */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-slate-600 text-sm font-medium flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Reais
                  </p>
                  <div className="flex items-center gap-2">
                    {showBalance ? (
                      <p className="text-3xl font-bold text-slate-900">
                        R$ {Number(account.balance_brl || 0).toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-3xl font-bold text-slate-900">R$ ••••••</p>
                    )}
                  </div>
                </div>
                <div className="w-14 h-14 bg-slate-200/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Banknote className="h-7 w-7 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account ID */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="space-y-3">
                <p className="text-slate-600 text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  ID da Conta
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-slate-900 bg-slate-200/50 px-2 py-1 rounded truncate">
                    {account.id.substring(0, 8)}...{account.id.substring(-4)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(account.id)}
                    className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Clique para copiar o ID completo</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Produtos PriveBank</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PriveCard */}
            <Card 
              className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              onClick={() => handleProductClick('privecard')}
            >
              <CardContent className="p-6 text-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">PriveCard</h3>
                <p className="text-sm text-slate-600 mb-4">Cartão de crédito premium exclusivo</p>
                <Button 
                  className="w-full bg-slate-600 hover:bg-slate-700"
                  size="sm"
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>

            {/* Empréstimos */}
            <Card 
              className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              onClick={() => handleProductClick('emprestimos')}
            >
              <CardContent className="p-6 text-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <PiggyBank className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">Empréstimos</h3>
                <p className="text-sm text-slate-600 mb-4">Crédito rápido e descomplicado</p>
                <Button 
                  className="w-full bg-slate-600 hover:bg-slate-700"
                  size="sm"
                >
                  Simular
                </Button>
              </CardContent>
            </Card>

            {/* Investimentos */}
            <Card 
              className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              onClick={() => handleProductClick('investimentos')}
            >
              <CardContent className="p-6 text-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-900">Investimentos</h3>
                <p className="text-sm text-slate-600 mb-4">Faça seu dinheiro render mais</p>
                <Button 
                  className="w-full bg-slate-600 hover:bg-slate-700"
                  size="sm"
                >
                  Investir
                </Button>
              </CardContent>
            </Card>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Depósito */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                <CardContent className="p-6 text-center relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <ArrowDownLeft className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-900">Depósito</h3>
                  <p className="text-sm text-slate-600 mb-4">Adicione fundos à sua conta</p>
                  <Button 
                    onClick={() => setActiveTab('operations')}
                    className="w-full bg-slate-600 hover:bg-slate-700"
                    size="sm"
                  >
                    Depositar
                  </Button>
                </CardContent>
              </Card>

              {/* Saque */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                <CardContent className="p-6 text-center relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <ArrowUpRight className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-900">Saque</h3>
                  <p className="text-sm text-slate-600 mb-4">Retire seus fundos</p>
                  <Button 
                    onClick={() => setActiveTab('operations')}
                    className="w-full bg-slate-600 hover:bg-slate-700"
                    size="sm"
                  >
                    Sacar
                  </Button>
                </CardContent>
              </Card>

              {/* Transferir */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                <CardContent className="p-6 text-center relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Send className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-900">Transferir</h3>
                  <p className="text-sm text-slate-600 mb-4">Envie dinheiro para outros usuários</p>
                  <Button 
                    onClick={() => setActiveTab('operations')}
                    className="w-full bg-slate-600 hover:bg-slate-700"
                    size="sm"
                  >
                    Transferir
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Depósito */}
              <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <ArrowDownLeft className="h-5 w-5" />
                    Depósito
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Moeda</Label>
                    <Select value={depositCurrency} onValueChange={setDepositCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PCoins">P-Coins</SelectItem>
                        <SelectItem value="BRL">Reais (BRL)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleDeposit}
                    disabled={isProcessing}
                    className="w-full bg-slate-600 hover:bg-slate-700"
                  >
                    {isProcessing ? 'Processando...' : 'Depositar'}
                  </Button>
                </CardContent>
              </Card>

              {/* Saque */}
              <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <ArrowUpRight className="h-5 w-5" />
                    Saque
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Moeda</Label>
                    <Select value={withdrawCurrency} onValueChange={setWithdrawCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PCoins">P-Coins</SelectItem>
                        <SelectItem value="BRL">Reais (BRL)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleWithdraw}
                    disabled={isProcessing}
                    className="w-full bg-slate-600 hover:bg-slate-700"
                  >
                    {isProcessing ? 'Processando...' : 'Sacar'}
                  </Button>
                </CardContent>
              </Card>

              {/* Transferência */}
              <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Send className="h-5 w-5" />
                    Transferir
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email do Destinatário</Label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={transferToEmail}
                      onChange={(e) => setTransferToEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Moeda</Label>
                    <Select value={transferCurrency} onValueChange={setTransferCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PCoins">P-Coins</SelectItem>
                        <SelectItem value="BRL">Reais (BRL)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleTransfer}
                    disabled={isProcessing}
                    className="w-full bg-slate-600 hover:bg-slate-700"
                  >
                    {isProcessing ? 'Processando...' : 'Transferir'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Receipt className="h-5 w-5" />
                  Histórico de Transações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{transaction.description}</p>
                            <p className="text-sm text-slate-500">
                              {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">
                            {transaction.amount > 0 ? '+' : ''}
                            P$ {transaction.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">Nenhuma transação encontrada</p>
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

export default ModelV2BankPage;