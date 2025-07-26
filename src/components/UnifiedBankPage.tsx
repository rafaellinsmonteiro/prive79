
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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserType } from '@/hooks/useUserType';
import { useAbacatePay } from '@/hooks/useAbacatePay';
import { useUserPixDeposits } from '@/hooks/usePixDeposits';
import V2VipModel from '@/components/V2VipModel';
import { V2ClientLayout } from '@/components/V2ClientLayout';
import PixDepositModal from '@/components/PixDepositModal';
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
  Loader2,
  QrCode
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const UnifiedBankPage = () => {
  const { user } = useAuth();
  const { getUserType } = useUserType();
  const [userType, setUserType] = React.useState<'admin' | 'modelo' | 'cliente' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: pixDeposits } = useUserPixDeposits();
  
  // Debug: Log pixDeposits changes
  React.useEffect(() => {
    if (pixDeposits) {
      console.log('🔄 PIX Deposits atualizados no UnifiedBankPage (total:', pixDeposits.length, ')');
      pixDeposits.forEach((d, index) => {
        console.log(`   ${index + 1}. PIX ${d.pix_id.substring(0, 12)} - Status: ${d.status} - Processed: ${d.processed} - Amount: R$ ${d.amount}`);
      });
    }
  }, [pixDeposits]);
  
  // States for bank functionality
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showBalance, setShowBalance] = useState(true);
  const [menuExpanded, setMenuExpanded] = useState(window.innerWidth >= 768);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferCurrency, setTransferCurrency] = useState('PDolar');
  const [depositCurrency, setDepositCurrency] = useState('PDolar');
  const [withdrawCurrency, setWithdrawCurrency] = useState('PDolar');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // PIX states
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [pixData, setPixData] = useState<any>(null);

  // Transfer filters state
  const [transactionFilters, setTransactionFilters] = useState({
    dateRange: 'all',
    transactionType: 'all',
    currency: 'all'
  });

  const { account, transactions, isLoading } = usePrivaBank(transactionFilters);
  const transferMutation = useTransferBetweenAccounts();
  const { createPixQrCode, isLoading: pixLoading } = useAbacatePay();

  React.useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        const type = await getUserType();
        setUserType(type);
      }
    };
    checkUserType();
  }, [user, getUserType]);

  // PIX handlers
  const handlePixDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido para depósito",
        variant: "destructive"
      });
      return;
    }

    if (depositCurrency !== 'BRL') {
      toast({
        title: "Erro",
        description: "PIX só está disponível para depósitos em Reais (R$)",
        variant: "destructive"
      });
      return;
    }

    // Verificar se o CPF está cadastrado
    const userCpf = user?.user_metadata?.cpf;
    if (!userCpf) {
      toast({
        title: "CPF obrigatório",
        description: "Para gerar PIX é necessário cadastrar seu CPF. Acesse 'Minha Conta' > 'Dados Pessoais' para cadastrar.",
        variant: "destructive"
      });
      return;
    }

    setPixData(null);
    setPixModalOpen(true);

    try {
      const pixResult = await createPixQrCode({
        amount: parseFloat(depositAmount),
        description: `Depósito PriveBank - R$ ${depositAmount}`,
        customerName: user?.user_metadata?.name || 'Cliente PriveBank',
        customerEmail: user?.email,
        customerPhone: user?.user_metadata?.whatsapp,
        customerTaxId: userCpf
      });

      if (pixResult) {
        setPixData(pixResult);
      } else {
        setPixModalOpen(false);
      }
    } catch (error) {
      console.error('Erro ao criar PIX:', error);
      setPixModalOpen(false);
    }
  };

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

    // Para depósitos em Reais, usar PIX
    if (depositCurrency === 'BRL') {
      await handlePixDeposit();
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulating deposit API call for P-Dólar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Depósito realizado!",
        description: `P$ ${depositAmount} depositado com sucesso.`
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

    const currentBalance = withdrawCurrency === 'PDolar' ? account?.balance : account?.balance_brl;
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
        description: `${withdrawCurrency === 'PDolar' ? 'P$' : 'R$'} ${withdrawAmount} sacado com sucesso.`
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

    const currentBalance = transferCurrency === 'PDolar' ? account?.balance : account?.balance_brl;
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
        description: `Transferência de ${transferCurrency === 'PDolar' ? 'P-Dólar' : 'Reais'}`
      });
      
      toast({
        title: "Transferência realizada!",
        description: `${transferCurrency === 'PDolar' ? 'P$' : 'R$'} ${transferAmount} transferido para ${recipientEmail}`
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
    if (userType === 'modelo') {
      navigate(`/v2/bank/${product}`);
    } else if (userType === 'cliente') {
      navigate(`/v2/client/privebank/${product}`);
    } else {
      navigate(`/v2/bank/${product}`);
    }
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
                    <h3 className="text-sm font-semibold text-blue-100">CONTA</h3>
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
                    <h3 className="font-semibold text-blue-100">CONTA</h3>
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

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger 
                value="dashboard" 
                className="rounded-md text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="operations" 
                className="rounded-md text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Operações
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="rounded-md text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* P-Coins Balance */}
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">P-Dólar</p>
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

              {/* Quick Actions */}
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

            <TabsContent value="operations" className="mt-6">
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
                          <SelectItem value="PDolar">P-Dólar</SelectItem>
                          <SelectItem value="BRL">Reais (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleDeposit} 
                      className="w-full" 
                      disabled={isProcessing}
                    >
                      {isProcessing || pixLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {depositCurrency === 'BRL' ? 'Gerando PIX...' : 'Processando...'}
                        </>
                      ) : (
                        depositCurrency === 'BRL' ? 'Gerar QRCode PIX' : 'Depositar'
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
                          <SelectItem value="PDolar">P-Dólar</SelectItem>
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
                          <SelectItem value="PDolar">P-Dólar</SelectItem>
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

            <TabsContent value="history" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Histórico de Transações</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Mostrar transações normais e PIX deposits */}
                  {((transactions && transactions.length > 0) || (pixDeposits && pixDeposits.length > 0)) ? (
                    <div className="space-y-4">
                      {/* PIX deposits */}
                       {pixDeposits?.map((deposit) => (
                        <div key={`pix-${deposit.id}`} className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/20">
                              <ArrowDownLeft className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Depósito PIX</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(deposit.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </p>
                              <p className="text-sm text-muted-foreground">PIX ID: {deposit.pix_id.substring(0, 8)}...</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold text-green-500">
                                +R$ {Number(deposit.amount).toFixed(2)}
                              </p>
                              <Badge variant={
                                deposit.status === 'PAID' ? 'default' : 
                                deposit.status === 'PENDING' ? 'secondary' : 
                                'destructive'
                              }>
                                {deposit.status === 'PAID' ? 'Pago' : 
                                 deposit.status === 'PENDING' ? 'Pendente' : 
                                 deposit.status === 'CANCELLED' ? 'Cancelado' : 
                                 'Expirado'}
                              </Badge>
                            </div>
                            {/* Botão Ver QR Code para PIX pendentes */}
                            {deposit.status === 'PENDING' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  // Buscar dados atualizados do PIX via API
                                  try {
                                    const { data, error } = await supabase.functions.invoke('abacatepay-pix', {
                                      body: {
                                        action: 'status',
                                        pixId: deposit.pix_id
                                      }
                                    });

                                    if (!error && data) {
                                      setPixData({
                                        id: deposit.pix_id,
                                        brCode: deposit.br_code,
                                        brCodeBase64: data.brCodeBase64 || `data:image/png;base64,${deposit.br_code}`,
                                        expiresAt: deposit.expires_at,
                                        status: data.status || deposit.status
                                      });
                                    } else {
                                      // Fallback para dados locais
                                      setPixData({
                                        id: deposit.pix_id,
                                        brCode: deposit.br_code,
                                        brCodeBase64: `data:image/png;base64,${deposit.br_code}`,
                                        expiresAt: deposit.expires_at,
                                        status: deposit.status
                                      });
                                    }
                                  } catch (error) {
                                    // Em caso de erro, usar dados locais
                                    setPixData({
                                      id: deposit.pix_id,
                                      brCode: deposit.br_code,
                                      brCodeBase64: `data:image/png;base64,${deposit.br_code}`,
                                      expiresAt: deposit.expires_at,
                                      status: deposit.status
                                    });
                                  }
                                  setPixModalOpen(true);
                                }}
                                className="flex items-center gap-1"
                              >
                                <QrCode className="h-3 w-3" />
                                Ver QR
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Transações normais */}
                      {transactions?.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              transaction.transaction_type === 'deposit' || transaction.transaction_type === 'deposit_pix' ? 'bg-green-500/20' : 
                              transaction.transaction_type === 'withdrawal' ? 'bg-red-500/20' : 
                              'bg-blue-500/20'
                            }`}>
                              {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'deposit_pix' ? 
                                <ArrowDownLeft className="h-5 w-5 text-green-500" /> : 
                                transaction.transaction_type === 'withdrawal' ? 
                                <ArrowUpRight className="h-5 w-5 text-red-500" /> : 
                                <Send className="h-5 w-5 text-blue-500" />
                              }
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {transaction.transaction_type === 'deposit' ? 'Depósito' : 
                                 transaction.transaction_type === 'deposit_pix' ? 'Depósito PIX' :
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
                              transaction.transaction_type === 'deposit' || transaction.transaction_type === 'deposit_pix' ? 'text-green-500' : 
                              transaction.from_account_id === account?.id ? 'text-red-500' : 'text-green-500'
                            }`}>
                              {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'deposit_pix' ? '+' : 
                               transaction.from_account_id === account?.id ? '-' : '+'}
                              {transaction.currency === 'BRL' ? 'R$' : 'P$'} {Number(transaction.amount).toFixed(2)}
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
        
        {/* PIX Deposit Modal */}
        <PixDepositModal
          isOpen={pixModalOpen}
          onClose={() => {
            setPixModalOpen(false);
            setPixData(null);
            setDepositAmount('');
          }}
          amount={parseFloat(depositAmount) || 0}
          pixData={pixData}
        />
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
      
      {/* PIX Deposit Modal */}
      <PixDepositModal
        isOpen={pixModalOpen}
        onClose={() => {
          setPixModalOpen(false);
          setPixData(null);
          setDepositAmount('');
        }}
        amount={parseFloat(depositAmount) || 0}
        pixData={pixData}
      />
    </V2ClientLayout>
  );
};

export default UnifiedBankPage;
