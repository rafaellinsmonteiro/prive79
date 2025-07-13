import React from 'react';
import DesignTestLayout from '@/components/design-test/DesignTestLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star, Calendar, DollarSign, TrendingUp, Eye } from 'lucide-react';

const AdminDesignTestDashboard = () => {
  const stats = [
    {
      title: 'Total de Modelos',
      value: '156',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      change: '+12%',
    },
    {
      title: 'Agendamentos',
      value: '89',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      change: '+8%',
    },
    {
      title: 'Avaliações',
      value: '234',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      change: '+15%',
    },
    {
      title: 'Receita',
      value: 'R$ 45.890',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
      change: '+23%',
    },
  ];

  return (
    <DesignTestLayout title="Dashboard Admin">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20 hover:shadow-lg transition-all duration-200 group">
              <CardContent className="flex items-center p-6">
                <div className={`rounded-full p-3 ${stat.bgColor} mr-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[hsl(var(--dark-muted))]">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-[hsl(var(--gold-primary))]">{stat.value}</p>
                  <p className="text-sm text-green-500 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modelos Recentes */}
        <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
          <CardHeader>
            <CardTitle className="text-[hsl(var(--gold-primary))]">Modelos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--dark-primary))]/50 border border-[hsl(var(--gold-accent))]/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))]"></div>
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--dark-text))]">Modelo {i}</p>
                      <p className="text-xs text-[hsl(var(--dark-muted))]">Registrado hoje</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs ml-1">4.{8 + i}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agendamentos Hoje */}
        <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
          <CardHeader>
            <CardTitle className="text-[hsl(var(--gold-primary))]">Agendamentos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--dark-primary))]/50 border border-[hsl(var(--gold-accent))]/10">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[hsl(var(--dark-text))]">
                      Agendamento #{i}234
                    </p>
                    <p className="text-xs text-[hsl(var(--dark-muted))]">
                      {9 + i}:00 - Cliente ABC
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[hsl(var(--gold-primary))]">
                      R$ {150 + (i * 50)}
                    </p>
                    <p className="text-xs text-green-500">Confirmado</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="mt-8">
        <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
          <CardHeader>
            <CardTitle className="text-[hsl(var(--gold-primary))]">Atividade da Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-[hsl(var(--dark-primary))]/50 border border-[hsl(var(--gold-accent))]/10">
                <Eye className="h-8 w-8 text-[hsl(var(--gold-primary))] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[hsl(var(--gold-primary))]">2.5k</p>
                <p className="text-sm text-[hsl(var(--dark-muted))]">Visualizações hoje</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[hsl(var(--dark-primary))]/50 border border-[hsl(var(--gold-accent))]/10">
                <Users className="h-8 w-8 text-[hsl(var(--gold-primary))] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[hsl(var(--gold-primary))]">189</p>
                <p className="text-sm text-[hsl(var(--dark-muted))]">Usuários ativos</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[hsl(var(--dark-primary))]/50 border border-[hsl(var(--gold-accent))]/10">
                <Calendar className="h-8 w-8 text-[hsl(var(--gold-primary))] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[hsl(var(--gold-primary))]">47</p>
                <p className="text-sm text-[hsl(var(--dark-muted))]">Agendamentos pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DesignTestLayout>
  );
};

export default AdminDesignTestDashboard;