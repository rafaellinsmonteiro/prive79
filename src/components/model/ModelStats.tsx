
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Eye, MessageCircle, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ModelStatsProps {
  modelId: string;
}

const ModelStats = ({ modelId }: ModelStatsProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['model-stats', modelId],
    queryFn: async () => {
      // Buscar estatísticas básicas
      const [photosResult, videosResult, conversationsResult] = await Promise.all([
        supabase
          .from('model_photos')
          .select('id')
          .eq('model_id', modelId),
        supabase
          .from('model_videos')
          .select('id')
          .eq('model_id', modelId),
        supabase
          .from('conversations')
          .select('id')
          .eq('model_id', modelId),
      ]);

      return {
        totalPhotos: photosResult.data?.length || 0,
        totalVideos: videosResult.data?.length || 0,
        totalConversations: conversationsResult.data?.length || 0,
        profileViews: Math.floor(Math.random() * 1000) + 100, // Simulado
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="text-zinc-400">Carregando estatísticas...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Visualizações do Perfil',
      value: stats?.profileViews || 0,
      icon: Eye,
      description: 'Últimos 30 dias',
    },
    {
      title: 'Total de Fotos',
      value: stats?.totalPhotos || 0,
      icon: Heart,
      description: 'Fotos publicadas',
    },
    {
      title: 'Total de Vídeos',
      value: stats?.totalVideos || 0,
      icon: BarChart3,
      description: 'Vídeos publicados',
    },
    {
      title: 'Conversas',
      value: stats?.totalConversations || 0,
      icon: MessageCircle,
      description: 'Conversas ativas',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="bg-zinc-800 border-zinc-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-5 w-5 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm font-medium text-zinc-300">{stat.title}</p>
                        <p className="text-xs text-zinc-500">{stat.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelStats;
