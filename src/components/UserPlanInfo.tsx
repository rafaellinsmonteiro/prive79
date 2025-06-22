
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, User } from "lucide-react";

const UserPlanInfo = () => {
  const { data: currentUser, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentUser) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-400">Informações do usuário não disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="h-5 w-5" />
          Perfil do Usuário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-zinc-400 text-sm">Nome</p>
          <p className="text-white font-medium">{currentUser.name || 'Não informado'}</p>
        </div>
        
        <div>
          <p className="text-zinc-400 text-sm">Email</p>
          <p className="text-white">{currentUser.email}</p>
        </div>

        <div>
          <p className="text-zinc-400 text-sm">Tipo de Usuário</p>
          <Badge 
            variant={currentUser.user_role === 'admin' ? 'destructive' : 'secondary'}
            className="mt-1"
          >
            {currentUser.user_role === 'admin' ? 'Administrador' : 
             currentUser.user_role === 'modelo' ? 'Modelo' : 'Cliente'}
          </Badge>
        </div>

        <div>
          <p className="text-zinc-400 text-sm">Plano Atual</p>
          {currentUser.plan ? (
            <div className="flex items-center gap-2 mt-1">
              <Crown className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-white font-medium">{currentUser.plan.name}</p>
                <p className="text-green-400 text-sm">
                  R$ {Number(currentUser.plan.price).toFixed(2)}
                </p>
                {currentUser.plan.description && (
                  <p className="text-zinc-400 text-xs">{currentUser.plan.description}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 mt-1">Nenhum plano ativo</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPlanInfo;
