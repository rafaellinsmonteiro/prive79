
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { useDeleteUser } from '@/hooks/useAdminUsers';
import { toast } from 'sonner';

type SystemUser = Tables<'system_users'> & {
  plans?: Tables<'plans'>;
};

interface UsersListProps {
  users: SystemUser[];
  loading: boolean;
  onEdit: (id: string) => void;
}

const UsersList = ({ users, loading, onEdit }: UsersListProps) => {
  const deleteUserMutation = useDeleteUser();

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUserMutation.mutateAsync(id);
        toast.success('Usuário excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir usuário');
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500';
      case 'modelo':
        return 'bg-purple-500';
      case 'cliente':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-white">Carregando usuários...</div>;
  }

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <Card key={user.id} className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  {user.name || user.email}
                  <Badge className={`${getRoleBadgeColor(user.user_role)} text-white`}>
                    {user.user_role}
                  </Badge>
                  {!user.is_active && (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </CardTitle>
                <p className="text-zinc-400 text-sm">{user.email}</p>
                {user.phone && (
                  <p className="text-zinc-400 text-sm">{user.phone}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(user.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(user.id)}
                  disabled={deleteUserMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.plans && (
                <div>
                  <span className="text-zinc-400 text-sm">Plano: </span>
                  <span className="text-white">
                    {user.plans.name} - R$ {user.plans.price}
                  </span>
                </div>
              )}
              <div>
                <span className="text-zinc-400 text-sm">Criado em: </span>
                <span className="text-white">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UsersList;
