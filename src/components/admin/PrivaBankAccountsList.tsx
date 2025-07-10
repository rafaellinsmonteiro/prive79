import { Edit, Trash2, Wallet, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useDeletePrivaBankAccount } from '@/hooks/usePrivaBank';
import { toast } from 'sonner';

interface PrivaBankAccount {
  id: string;
  user_id: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

interface PrivaBankAccountsListProps {
  accounts: PrivaBankAccount[];
  loading: boolean;
  onEdit: (id: string) => void;
}

const PrivaBankAccountsList = ({ accounts, loading, onEdit }: PrivaBankAccountsListProps) => {
  const deleteAccount = useDeletePrivaBankAccount();

  const handleDelete = async (accountId: string) => {
    try {
      await deleteAccount.mutateAsync(accountId);
      toast.success('Conta PriveBank excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting PriveBank account:', error);
      toast.error('Erro ao excluir conta PriveBank');
    }
  };

  if (loading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="text-center text-zinc-400">Carregando contas...</div>
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="text-center text-zinc-400">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <p>Nenhuma conta PriveBank encontrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <Card key={account.id} className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-white">
                      {account.user_name}
                    </h3>
                    <Badge variant={account.is_active ? "default" : "secondary"}>
                      {account.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-zinc-400">
                    <User className="h-4 w-4" />
                    <span>{account.user_email}</span>
                  </div>
                  <div className="text-sm text-zinc-400 mt-1">
                    Criada em: {new Date(account.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    P$ {Number(account.balance).toLocaleString('pt-BR', { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2 
                    })}
                  </div>
                  <div className="text-sm text-zinc-400">Saldo atual</div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(account.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a conta PriveBank de {account.user_name}?
                          Esta ação não pode ser desfeita e todas as transações relacionadas serão perdidas.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(account.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PrivaBankAccountsList;