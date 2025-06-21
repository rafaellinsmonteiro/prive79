
import { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import UsersList from './UsersList';
import UserForm from './UserForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const UsersManager = () => {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: users = [], isLoading } = useAdminUsers();

  const handleEdit = (id: string) => {
    setEditingUserId(id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingUserId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestão de Usuários</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUserId ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            <UserForm
              userId={editingUserId}
              onSuccess={handleCloseForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      <UsersList
        users={users}
        loading={isLoading}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default UsersManager;
