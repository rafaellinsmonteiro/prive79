
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePrivaBank, useTransferBetweenAccounts } from '@/hooks/usePrivaBank';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserType } from '@/hooks/useUserType';
import V2VipModel from '@/components/V2VipModel';
import { V2ClientLayout } from '@/components/V2ClientLayout';
import {
  Wallet,
  TrendingUp,
  ArrowRightLeft,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  Eye,
  EyeOff,
  Copy,
  Shield,
  Hash,
  CreditCard,
  Banknote,
  Star,
  PiggyBank,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const UnifiedBankPage = () => {
  const { user } = useAuth();
  const { getUserType } = useUserType();
  const [userType, setUserType] = React.useState<'admin' | 'modelo' | 'cliente' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // States for bank functionality
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showBalance, setShowBalance] = useState(true);
  const [menuExpanded, setMenuExpanded] = useState(window.innerWidth >= 768);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferCurrency, setTransferCurrency] = useState('PCoins');
  const [depositCurrency, setDepositCurrency] = useState('PCoins');
  const [withdrawCurrency, setWithdrawCurrency] = useState('PCoins');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Transfer filters state
  const [transactionFilters, setTransactionFilters] = useState({
    dateRange: 'all',
    transactionType: 'all',
    currency: 'all'
  });

  const { account, transactions, isLoading } = usePrivaBank(transactionFilters);
  const transferMutation = useTransferBetweenAccounts();

  React.useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        const type = await getUserType();
        setUserType(type);
      }
    };
    checkUserType();
  }, [user, getUserType]);

  // Bank operations handlers
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
      // Simulating deposit API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Depósito realizado!",
        description: `${depositCurrency === 'PCoins' ? 'P$' : 'R$'} ${depositAmount} depositado com sucesso.`
      });
      
      setDepositAmount('');
    } catch (error) {
      toast({
        title: "Erro no depósito",
        description: "Tente novamente mais tarde",
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

    const currentBalance = withdrawCurrency === 'PCoins' ? account?.balance : account?.balance_brl;
    if (parseFloat(withdrawAmount) > (currentBalance || 0)) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não possui saldo suficiente para este saque",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Saque realizado!",
        description: `${withdrawCurrency === 'PCoins' ? 'P$' : 'R$'} ${withdrawAmount} sacado com sucesso.`
      });
      
      setWithdrawAmount('');
    } catch (error) {
      toast({
        title: "Erro no saque",
        description: "Tente novamente mais tarde",
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

    if (!recipientEmail) {
      toast({
        title: "Erro", 
        description: "Digite o email do destinatário",
        variant: "destructive"
      });
      return;
    }

    const currentBalance = transferCurrency === 'PCoins' ? account?.balance : account?.balance_brl;
    if (parseFloat(transferAmount) > (currentBalance || 0)) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não possui saldo suficiente para esta transferência",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      await transferMutation.mutateAsync({
        fromAccountId: account.id,
        toUserEmail: recipientEmail,
        amount: parseFloat(transferAmount),
        description: `Transferência de ${transferCurrency === 'PCoins' ? 'P-Coins' : 'Reais'}`
      });
      
      toast({
        title: "Transferência realizada!",
        description: `${transferCurrency === 'PCoins' ? 'P$' : 'R$'} ${transferAmount} transferido para ${recipientEmail}`
      });
      
      setTransferAmount('');
      setRecipientEmail('');
    } catch (error: any) {
      toast({
        title: "Erro na transferência",
        description: error?.message || "Tente novamente mais tarde",
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

  if (!userType) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Carregando...</div>
      </div>
    );
  }

  const bankContent = (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Carregando sua conta PriveBank...</p>
          </div>
        </div>
      ) : !account || !account.is_active ? (
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
      ) : (
        <div className="space-y-6">
          {/* Collapsible Top Menu */}
          <div className="mb-6">
            {/* Mobile Layout */}
            <div className="block md:hidden">
              <div className="flex gap-3 mb-4">
                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 border-blue-500/30 flex-1">
                  <CardContent className="p-4 text-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/30 to-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-blue-100">GERAL</h3>
                  </CardContent>
                </Card>
                
                <Card className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer flex-1" onClick={() => setMenuExpanded(!menuExpanded)}>
                  <CardContent className="p-4 text-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      {menuExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">MENU</h3>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">PriveBank - Soluções</h2>
                <Button
                  variant="ghost"
                  onClick={() => setMenuExpanded(!menuExpanded)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {menuExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="ml-2">{menuExpanded ? 'Minimizar' : 'Expandir'}</span>
                </Button>
              </div>
            </div>
            
            {menuExpanded && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in">
                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 border-blue-500/30 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-blue-100">GERAL</h3>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => setActiveTab('history')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Receipt className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="font-semibold text-foreground">HISTÓRICO</h3>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => handleProductClick('privecard')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="h-6 w-6 text-purple-500" />
                    </div>
                    <h3 className="font-semibold text-foreground">CARTÕES</h3>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => handleProductClick('emprestimos')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <PiggyBank className="h-6 w-6 text-orange-500" />
                    </div>
                    <h3 className="font-semibold text-foreground">EMPRÉSTIMOS</h3>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => handleProductClick('investimentos')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="font-semibold text-foreground">INVESTIMENTOS</h3>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

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
                      <ArrowDownLeft className="h-5 w-5 text-green-500" />
                      Depósito
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deposit-amount">Valor</Label>
                      <Input
                        id="deposit-amount"
                        type="number"
                        placeholder="0.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deposit-currency">Moeda</Label>
                      <Select value={depositCurrency} onValueChange={setDepositCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PCoins">P-Coins</SelectItem>
                          <SelectItem value="BRL">Reais (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleDeposit} 
                      className="w-full" 
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Depositar'
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Saque */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <ArrowUpRight className="h-5 w-5 text-red-500" />
                      Saque
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-amount">Valor</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-currency">Moeda</Label>
                      <Select value={withdrawCurrency} onValueChange={setWithdrawCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PCoins">P-Coins</SelectItem>
                          <SelectItem value="BRL">Reais (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleWithdraw} 
                      className="w-full" 
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Sacar'
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Transferir */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Send className="h-5 w-5 text-blue-500" />
                      Transferir
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient-email">Email do destinatário</Label>
                      <Input
                        id="recipient-email"
                        type="email"
                        placeholder="usuario@exemplo.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transfer-amount">Valor</Label>
                      <Input
                        id="transfer-amount"
                        type="number"
                        placeholder="0.00"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transfer-currency">Moeda</Label>
                      <Select value={transferCurrency} onValueChange={setTransferCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PCoins">P-Coins</SelectItem>
                          <SelectItem value="BRL">Reais (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleTransfer} 
                      className="w-full" 
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Transferir'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Histórico de Transações</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions && transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              transaction.transaction_type === 'deposit' ? 'bg-green-500/20' : 
                              transaction.transaction_type === 'withdrawal' ? 'bg-red-500/20' : 
                              'bg-blue-500/20'
                            }`}>
                              {transaction.transaction_type === 'deposit' ? 
                                <ArrowDownLeft className="h-5 w-5 text-green-500" /> : 
                                transaction.transaction_type === 'withdrawal' ? 
                                <ArrowUpRight className="h-5 w-5 text-red-500" /> : 
                                <Send className="h-5 w-5 text-blue-500" />
                              }
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {transaction.transaction_type === 'deposit' ? 'Depósito' : 
                                 transaction.transaction_type === 'withdrawal' ? 'Saque' : 
                                 'Transferência'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </p>
                              {transaction.description && (
                                <p className="text-sm text-muted-foreground">{transaction.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${
                              transaction.transaction_type === 'deposit' ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {transaction.transaction_type === 'deposit' ? '+' : '-'}
                              {transaction.currency === 'PCoins' ? 'P$' : 'R$'} {Number(transaction.amount).toFixed(2)}
                            </p>
                            <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                              {transaction.status === 'completed' ? 'Concluída' : 'Pendente'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );

  if (userType === 'modelo') {
    return (
      <V2VipModel 
        title="PriveBank"
        subtitle="Sua carteira digital premium."
        activeId="bank"
      >
        {bankContent}
      </V2VipModel>
    );
  }

  // Para cliente
  return (
    <V2ClientLayout 
      title="PriveBank" 
      subtitle="Sua carteira digital" 
      activeId="privebank"
    >
      {bankContent}
    </V2ClientLayout>
  );
};

export default UnifiedBankPage;
