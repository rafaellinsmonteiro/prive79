import React from 'react';
import DarkLayout from '@/components/DarkLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, MessageCircle, Calendar, CreditCard, 
  Star, TrendingUp, Users, Search 
} from 'lucide-react';

export default function ClientV2DashboardPage() {
  const stats = [
    { title: 'Agendamentos', value: '12', icon: Calendar, color: 'text-blue-600' },
    { title: 'Mensagens', value: '8', icon: MessageCircle, color: 'text-green-600' },
    { title: 'Favoritos', value: '5', icon: Heart, color: 'text-red-600' },
    { title: 'Saldo PriveBank', value: 'R$ 150', icon: CreditCard, color: 'text-purple-600' },
  ];

  const recentActivity = [
    { type: 'appointment', message: 'Agendamento confirmado com Anna', time: '2h atrás' },
    { type: 'message', message: 'Nova mensagem de Julia', time: '4h atrás' },
    { type: 'review', message: 'Avaliação enviada para Camila', time: '1 dia atrás' },
    { type: 'payment', message: 'Recarga PriveBank R$ 100', time: '2 dias atrás' },
  ];

  const suggestedModels = [
    { name: 'Mariana', location: 'São Paulo', rating: 4.9, image: '/placeholder.svg' },
    { name: 'Isabella', location: 'Rio de Janeiro', rating: 4.8, image: '/placeholder.svg' },
    { name: 'Fernanda', location: 'Belo Horizonte', rating: 4.7, image: '/placeholder.svg' },
  ];

  return (
    <DarkLayout title="Dashboard">
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-zinc-800 border-zinc-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start bg-zinc-700 hover:bg-zinc-600 text-white border-zinc-600" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Buscar Modelos
              </Button>
              <Button className="w-full justify-start bg-zinc-700 hover:bg-zinc-600 text-white border-zinc-600" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Encontro
              </Button>
              <Button className="w-full justify-start bg-zinc-700 hover:bg-zinc-600 text-white border-zinc-600" variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Iniciar Conversa
              </Button>
              <Button className="w-full justify-start bg-zinc-700 hover:bg-zinc-600 text-white border-zinc-600" variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Recarregar PriveBank
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.message}</p>
                    <p className="text-xs text-zinc-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Suggested Models */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Sugestões para Você</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestedModels.map((model, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-zinc-700 rounded-lg">
                  <img 
                    src={model.image} 
                    alt={model.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{model.name}</p>
                    <p className="text-xs text-zinc-400">{model.location}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-zinc-400 ml-1">{model.rating}</span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-zinc-600 hover:bg-zinc-500 text-white border-zinc-500" variant="outline">Ver</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white">Resumo da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-zinc-400">Este Mês</span>
                </div>
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-sm text-zinc-400">Encontros realizados</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm text-zinc-400">Total</span>
                </div>
                <p className="text-2xl font-bold text-white">15</p>
                <p className="text-sm text-zinc-400">Modelos conhecidas</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="text-sm text-zinc-400">Avaliação</span>
                </div>
                <p className="text-2xl font-bold text-white">4.8</p>
                <p className="text-sm text-zinc-400">Média das avaliações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DarkLayout>
  );
}