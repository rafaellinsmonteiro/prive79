import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  DollarSign, 
  Target, 
  Wallet, 
  Camera, 
  Star, 
  User, 
  Settings,
  Plus,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppointments } from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import { usePrivaBank } from '@/hooks/usePrivaBank';
import { format, addDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import dashboardHeroBg from '@/assets/dashboard-hero-bg.jpg';

interface ModelDashboardHomeProps {
  profile: any;
  modelId: string;
  onSectionChange: (section: string) => void;
}

const ModelDashboardHome = ({ profile, modelId, onSectionChange }: ModelDashboardHomeProps) => {
  const { appointments, isLoading: appointmentsLoading } = useAppointments();
  const { services } = useServices();
  const { account } = usePrivaBank();
  const balance = account?.balance || 0;

  // Próximos agendamentos (próximos 7 dias)
  const nextWeek = addDays(new Date(), 7);
  const upcomingAppointments = appointments?.filter(app => 
    isAfter(new Date(app.appointment_date), new Date()) &&
    !isAfter(new Date(app.appointment_date), nextWeek)
  ).slice(0, 3) || [];

  // Ganhos do mês atual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyEarnings = appointments?.reduce((total, app) => {
    const appDate = new Date(app.appointment_date);
    if (appDate.getMonth() === currentMonth && 
        appDate.getFullYear() === currentYear && 
        app.payment_status === 'paid') {
      return total + (app.total_paid || 0);
    }
    return total;
  }, 0) || 0;

  // Meta mensal (simulada - poderia vir de uma tabela de metas)
  const monthlyGoal = 5000;
  const goalProgress = (monthlyEarnings / monthlyGoal) * 100;

  // Estatísticas de mídia
  const { data: mediaStats } = useQuery({
    queryKey: ['media-stats', modelId],
    queryFn: async () => {
      const [photosResult, videosResult] = await Promise.all([
        supabase
          .from('model_photos')
          .select('id')
          .eq('model_id', modelId),
        supabase
          .from('model_videos')
          .select('id')
          .eq('model_id', modelId),
      ]);

      return {
        totalPhotos: photosResult.data?.length || 0,
        totalVideos: videosResult.data?.length || 0,
      };
    },
  });

  // Nota geral (simulada - poderia vir de avaliações)
  const overallRating = 4.8;

  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <Card className="relative overflow-hidden border-amber-600/30">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${dashboardHeroBg})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <CardContent className="relative p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Olá, {profile?.models?.name || 'Modelo'}! 👋
              </h1>
              <p className="text-zinc-200">
                Bem-vinda ao seu dashboard. Aqui está um resumo das suas atividades.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="text-xl font-bold text-white">{overallRating}</span>
              <span className="text-zinc-300 text-sm">avaliação</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ganhos do mês */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div className="flex-1">
                <p className="text-2xl font-bold text-white">
                  R$ {monthlyEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm font-medium text-zinc-300">Ganhos do Mês</p>
                <p className="text-xs text-zinc-500">
                  {appointments?.filter(a => a.payment_status === 'paid').length || 0} pagamentos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PriveBank */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-2xl font-bold text-white">
                  R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm font-medium text-zinc-300">PriveBank</p>
                <p className="text-xs text-zinc-500">Saldo disponível</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próximos agendamentos */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              <div className="flex-1">
                <p className="text-2xl font-bold text-white">{upcomingAppointments.length}</p>
                <p className="text-sm font-medium text-zinc-300">Próximos Agendamentos</p>
                <p className="text-xs text-zinc-500">Próximos 7 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de mídias */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-pink-400" />
              <div className="flex-1">
                <p className="text-2xl font-bold text-white">
                  {(mediaStats?.totalPhotos || 0) + (mediaStats?.totalVideos || 0)}
                </p>
                <p className="text-sm font-medium text-zinc-300">Total de Mídias</p>
                <p className="text-xs text-zinc-500">
                  {mediaStats?.totalPhotos || 0} fotos • {mediaStats?.totalVideos || 0} vídeos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meta mensal */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" />
              Meta do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Progresso</span>
                <span className="text-white font-medium">
                  {goalProgress.toFixed(1)}%
                </span>
              </div>
              <Progress value={goalProgress} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">
                  R$ {monthlyEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-zinc-400">
                  R$ {monthlyGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {goalProgress >= 100 ? (
                <Badge className="bg-green-900 text-green-100">Meta atingida! 🎉</Badge>
              ) : (
                <p className="text-xs text-zinc-500">
                  Faltam R$ {(monthlyGoal - monthlyEarnings).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para sua meta
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Próximos agendamentos */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{appointment.client?.name}</p>
                      <p className="text-sm text-zinc-400">
                        {format(new Date(appointment.appointment_date), 'dd/MM', { locale: ptBR })} às {appointment.appointment_time}
                      </p>
                      <p className="text-xs text-zinc-500">{appointment.service?.name}</p>
                    </div>
                    <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  Ver todos os agendamentos
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-400 mb-3">Nenhum agendamento próximo</p>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar agendamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
          onClick={() => onSectionChange('media')}
        >
          <CardContent className="p-4 text-center">
            <Camera className="h-8 w-8 text-pink-400 mx-auto mb-2" />
            <h3 className="font-medium text-white mb-1">Publicar Mídia</h3>
            <p className="text-xs text-zinc-500">Adicione novas fotos ou vídeos</p>
          </CardContent>
        </Card>

        <Card 
          className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
          onClick={() => onSectionChange('profile')}
        >
          <CardContent className="p-4 text-center">
            <User className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-medium text-white mb-1">Perfil</h3>
            <p className="text-xs text-zinc-500">Atualize suas informações</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Settings className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <h3 className="font-medium text-white mb-1">Serviços</h3>
            <p className="text-xs text-zinc-500">Gerencie seus serviços</p>
            <Badge className="mt-1 text-xs">{services?.length || 0}</Badge>
          </CardContent>
        </Card>

        <Card 
          className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
          onClick={() => onSectionChange('stats')}
        >
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <h3 className="font-medium text-white mb-1">Estatísticas</h3>
            <p className="text-xs text-zinc-500">Veja seu desempenho</p>
          </CardContent>
        </Card>
      </div>

      {/* Dicas e estímulos */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-800/30">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                💡 Dica para aumentar seus ganhos
              </h3>
              <p className="text-zinc-300 mb-4">
                Modelos que publicam mídias regularmente ganham até 40% mais! 
                Que tal adicionar algumas fotos ou vídeos novos hoje?
              </p>
              <div className="flex space-x-3">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Mídia
                </Button>
                <Button variant="outline" size="sm">
                  Ver Dicas
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelDashboardHome;