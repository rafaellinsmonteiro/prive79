import React, { useState } from 'react';
import { Star, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useServices } from '@/hooks/useServices';
import V2VipModel from '@/components/V2VipModel';

const ModelV2ServicesPage = () => {
  const { services, isLoading } = useServices();

  return (
    <V2VipModel 
      title="Serviços"
      subtitle="Gerencie seus serviços e preços."
      activeId="services"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">{services?.length || 0}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold text-foreground">{services?.filter(s => s.is_active).length || 0}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Preço Médio</p>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {services?.length ? (services.reduce((sum, s) => sum + s.price, 0) / services.length).toFixed(0) : '0'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inativos</p>
                  <p className="text-2xl font-bold text-foreground">{services?.filter(s => !s.is_active).length || 0}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services List */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Carregando serviços...</div>
            ) : services?.length ? (
              <div className="grid gap-4">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                    <div>
                      <h3 className="font-medium text-foreground">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-primary font-medium">R$ {service.price}</span>
                        <span className="text-muted-foreground">{service.duration}min</span>
                      </div>
                    </div>
                    <Badge variant={service.is_active ? 'default' : 'secondary'}>
                      {service.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum serviço cadastrado ainda.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </V2VipModel>
  );
};

export default ModelV2ServicesPage;