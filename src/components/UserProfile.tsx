
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, LogOut, Edit2, Save, X } from 'lucide-react';

const UserProfile = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: user?.email || '',
    name: user?.user_metadata?.name || '',
  });

  const handleSignOut = async () => {
    console.log('User profile - signing out');
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
    }
  };

  const handleSave = () => {
    // Por enquanto, apenas mostra um toast - implementação futura para atualizar perfil
    toast({
      title: "Informações salvas",
      description: "Suas informações foram atualizadas (funcionalidade em desenvolvimento)"
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setUserInfo({
      email: user?.email || '',
      name: user?.user_metadata?.name || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <User className="h-8 w-8 text-zinc-400" />
        </div>
        <CardTitle className="text-zinc-100">Perfil do Usuário</CardTitle>
        {isAdmin && (
          <div className="inline-block bg-primary px-2 py-1 rounded text-xs text-white">
            Administrador
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-300">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={userInfo.email}
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
            disabled={!isEditing}
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 disabled:opacity-60"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-zinc-300">
            Nome
          </Label>
          <Input
            id="name"
            type="text"
            value={userInfo.name}
            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
            disabled={!isEditing}
            placeholder="Digite seu nome"
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col space-y-2">
          {!isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar Informações
              </Button>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
