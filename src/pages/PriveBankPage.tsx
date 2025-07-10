import { useState } from 'react';
import { usePrivaBank } from '@/hooks/usePrivaBank';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Wallet, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, DollarSign } from 'lucide-react';

const PriveBankPage = () => {
  const { user } = useAuth();
  const { account, transactions, isLoading, createTransaction } = usePrivaBank();
  const { toast } = useToast();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferToUserId, setTransferToUserId] = useState('');
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
        description: 'Depósito via PriveBank'
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

    if (parseFloat(withdrawAmount) > (account?.balance || 0)) {
      toast({
        title: "Erro",
        description: "Saldo insuficiente",
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
        description: 'Saque via PriveBank'
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
          <p className="text-zinc-400">Sua carteira digital P$ (P-Coin)</p>
        </div>

        {/* Saldo */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Saldo Disponível</p>
                <p className="text-3xl font-bold text-white">
                  P$ {Number(account.balance).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Button 
                    onClick={handleWithdraw}
                    disabled={isProcessing}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {isProcessing ? "Processando..." : "Sacar"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
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
                            <p className="text-white font-medium">
                              {transaction.transaction_type === 'deposit' && 'Depósito'}
                              {transaction.transaction_type === 'withdraw' && 'Saque'}
                              {transaction.transaction_type === 'transfer' && 'Transferência'}
                            </p>
                            <p className="text-zinc-400 text-sm">
                              {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            transaction.transaction_type === 'deposit' 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            {transaction.transaction_type === 'deposit' ? '+' : '-'}
                            P$ {Number(transaction.amount).toFixed(2)}
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