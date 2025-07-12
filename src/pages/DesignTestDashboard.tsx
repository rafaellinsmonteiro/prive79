import React from 'react';
import DesignTestLayout from '@/components/design-test/DesignTestLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Star, 
  DollarSign,
  Eye,
  MessageCircle,
  Plus,
  ArrowUpRight,
  Clock
} from 'lucide-react';

const statsCards = [
  {
    title: 'Receita Total',
    value: 'R$ 45.280',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    gradient: 'from-gold-primary to-gold-accent'
  },
  {
    title: 'Novos Clientes',
    value: '156',
    change: '+8.2%',
    trend: 'up',
    icon: Users,
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Agendamentos',
    value: '89',
    change: '+15.3%',
    trend: 'up',
    icon: Calendar,
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Avaliação Média',
    value: '4.8',
    change: '+0.3',
    trend: 'up',
    icon: Star,
    gradient: 'from-green-500 to-green-600'
  }
];

const recentActivity = [
  {
    type: 'appointment',
    title: 'Novo agendamento',
    description: 'Marina Silva agendou para hoje às 14:00',
    time: '5 min atrás',
    status: 'confirmed'
  },
  {
    type: 'review',
    title: 'Nova avaliação',
    description: 'Carlos deixou uma avaliação 5 estrelas',
    time: '12 min atrás',
    status: 'positive'
  },
  {
    type: 'message',
    title: 'Nova mensagem',
    description: 'Ana perguntou sobre disponibilidade',
    time: '18 min atrás',
    status: 'pending'
  },
  {
    type: 'payment',
    title: 'Pagamento recebido',
    description: 'R$ 320,00 de Roberto Santos',
    time: '25 min atrás',
    status: 'completed'
  }
];

const topModels = [
  {
    name: 'Isabella Rodriguez',
    revenue: 'R$ 8.450',
    appointments: 23,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
  },
  {
    name: 'Sophia Chen',
    revenue: 'R$ 7.890',
    appointments: 19,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    name: 'Emma Johnson',
    revenue: 'R$ 6.720',
    appointments: 17,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  }
];

export default function DesignTestDashboard() {
  return (
    <DesignTestLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index} className="bg-dark-card border-gold-accent/20 hover:border-gold-accent/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-dark-muted text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-dark-text mt-2">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-green-500 text-sm font-medium">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 bg-dark-card border-gold-accent/20">
            <CardHeader>
              <CardTitle className="text-dark-text flex items-center justify-between">
                Atividade Recente
                <Button variant="ghost" size="sm" className="text-gold-primary hover:text-gold-accent">
                  Ver todas
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-dark-primary/50">
                  <div className="w-2 h-2 rounded-full bg-gold-primary mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-dark-text">{activity.title}</h4>
                      <span className="text-xs text-dark-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-sm text-dark-muted mt-1">{activity.description}</p>
                    <Badge 
                      variant="secondary" 
                      className={`mt-2 text-xs ${
                        activity.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                        activity.status === 'positive' ? 'bg-green-500/20 text-green-400' :
                        activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gold-primary/20 text-gold-primary'
                      }`}
                    >
                      {activity.status === 'confirmed' ? 'Confirmado' :
                       activity.status === 'positive' ? 'Positiva' :
                       activity.status === 'pending' ? 'Pendente' :
                       'Concluído'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Models */}
          <Card className="bg-dark-card border-gold-accent/20">
            <CardHeader>
              <CardTitle className="text-dark-text">Top Modelos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topModels.map((model, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-dark-primary/50 hover:bg-dark-primary/70 transition-colors">
                  <img
                    src={model.image}
                    alt={model.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-dark-text">{model.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gold-primary font-medium">{model.revenue}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-dark-muted">{model.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-dark-muted">{model.appointments} agendamentos</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-dark-card border-gold-accent/20">
          <CardHeader>
            <CardTitle className="text-dark-text">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-20 bg-gradient-to-br from-gold-primary to-gold-accent hover:from-gold-accent hover:to-gold-primary text-dark-primary font-medium">
                <div className="flex flex-col items-center gap-2">
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">Novo Modelo</span>
                </div>
              </Button>
              <Button variant="outline" className="h-20 border-purple-500/20 text-purple-400 hover:bg-purple-500/10">
                <div className="flex flex-col items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">Agendamento</span>
                </div>
              </Button>
              <Button variant="outline" className="h-20 border-blue-500/20 text-blue-400 hover:bg-blue-500/10">
                <div className="flex flex-col items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">Mensagens</span>
                </div>
              </Button>
              <Button variant="outline" className="h-20 border-green-500/20 text-green-400 hover:bg-green-500/10">
                <div className="flex flex-col items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <span className="text-sm">Relatórios</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DesignTestLayout>
  );
}