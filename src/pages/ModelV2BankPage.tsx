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
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* P-Coins Balance */}
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">P-Coins</p>
                  <div className="flex items-center gap-2">
                    {showBalance ? (
                      <p className="text-2xl font-bold text-foreground">
                        P$ {Number(account.balance || 0).toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-2xl font-bold text-foreground">P$ ••••••</p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BRL Balance */}
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reais</p>
                  <div className="flex items-center gap-2">
                    {showBalance ? (
                      <p className="text-2xl font-bold text-foreground">
                        R$ {Number(account.balance_brl || 0).toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-2xl font-bold text-foreground">R$ ••••••</p>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg flex items-center justify-center">
                  <Banknote className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-2xl font-bold text-foreground">Premium</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Products */}
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Produtos</p>
                  <p className="text-2xl font-bold text-foreground">3</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Informações da Conta</h2>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                <Shield className="h-3 w-3 mr-1" />
                Conta Premium Ativa
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-accent/20 rounded-lg">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">ID da Conta</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-foreground">
                      {account.id.substring(0, 8)}...{account.id.substring(-4)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(account.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Section */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Produtos PriveBank</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* PriveCard */}
              <div 
                className="flex items-center justify-between p-4 bg-accent/20 rounded-lg cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => handleProductClick('privecard')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">PriveCard</h3>
                    <p className="text-sm text-muted-foreground">Cartão premium exclusivo</p>
                  </div>
                </div>
                <Badge variant="secondary">Em Breve</Badge>
              </div>

              {/* Empréstimos */}
              <div 
                className="flex items-center justify-between p-4 bg-accent/20 rounded-lg cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => handleProductClick('emprestimos')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg flex items-center justify-center">
                    <PiggyBank className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Empréstimos</h3>
                    <p className="text-sm text-muted-foreground">Crédito rápido e fácil</p>
                  </div>
                </div>
                <Badge variant="secondary">Em Breve</Badge>
              </div>

              {/* Investimentos */}
              <div 
                className="flex items-center justify-between p-4 bg-accent/20 rounded-lg cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => handleProductClick('investimentos')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Investimentos</h3>
                    <p className="text-sm text-muted-foreground">Rentabilidade premium</p>
                  </div>
                </div>
                <Badge variant="secondary">Em Breve</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Depósito */}
              <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => setActiveTab('operations')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg flex items-center justify-center">
                    <ArrowDownLeft className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Depósito</h3>
                    <p className="text-sm text-muted-foreground">Adicionar fundos</p>
                  </div>
                </div>
              </div>

              {/* Saque */}
              <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => setActiveTab('operations')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Saque</h3>
                    <p className="text-sm text-muted-foreground">Retirar fundos</p>
                  </div>
                </div>
              </div>

              {/* Transferir */}
              <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => setActiveTab('operations')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center">
                    <Send className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Transferir</h3>
                    <p className="text-sm text-muted-foreground">Enviar dinheiro</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Depósito */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
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
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {isProcessing ? 'Processando...' : 'Depositar'}
                  </Button>
                </CardContent>
              </Card>

              {/* Saque */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
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
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {isProcessing ? 'Processando...' : 'Sacar'}
                  </Button>
                </CardContent>
              </Card>

              {/* Transferência */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
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
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {isProcessing ? 'Processando...' : 'Transferir'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Receipt className="h-5 w-5" />
                  Histórico de Transações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">
                            {transaction.amount > 0 ? '+' : ''}
                            P$ {transaction.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma transação encontrada</p>
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