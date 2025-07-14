import React from 'react';
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useClients } from '@/hooks/useClients';
import V2VipModel from '@/components/V2VipModel';

const ModelV2ClientsPage = () => {
  const { clients, isLoading } = useClients();

  return (
    <V2VipModel 
      title="Clientes"
      subtitle="Gerencie seus clientes e relacionamentos."
      activeId="clients"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">{clients?.length || 0}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold text-foreground">{clients?.filter(c => c.is_active).length || 0}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Este Mês</p>
                  <p className="text-2xl font-bold text-foreground">
                    {clients?.filter(c => {
                      const created = new Date(c.created_at);
                      const now = new Date();
                      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                    }).length || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inativos</p>
                  <p className="text-2xl font-bold text-foreground">{clients?.filter(c => !c.is_active).length || 0}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients List */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Carregando clientes...</div>
            ) : clients?.length ? (
              <div className="grid gap-4">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-foreground">{client.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {client.email && <span>{client.email}</span>}
                          {client.phone && <span>{client.phone}</span>}
                        </div>
                      </div>
                    </div>
                    <Badge variant={client.is_active ? 'default' : 'secondary'}>
                      {client.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum cliente cadastrado ainda.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </V2VipModel>
  );
};

export default ModelV2ClientsPage;