import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingReviewsPanel } from '@/components/reviews/PendingReviewsPanel';
import { PriveTrustPanel } from '@/components/reviews/PriveTrustPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Clock, Shield, TrendingUp } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { usePriveTrust } from '@/hooks/usePriveTrust';

export default function ReviewsPage() {
  const { pendingReviews, myReviews } = useReviews();
  const { getPriveTrustProgress, getLevelInfo } = usePriveTrust();

  const priveTrustProgress = getPriveTrustProgress();
  const levelInfo = getLevelInfo();

  // Estatísticas de resumo
  const stats = [
    {
      title: 'Avaliações Pendentes',
      value: pendingReviews.length,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      title: 'Avaliações Enviadas',
      value: myReviews.length,
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Nível Atual',
      value: levelInfo?.currentLevel || 1,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Status Prive Trust',
      value: priveTrustProgress?.hasPriveTrust ? 'Conquistado' : 'Em Progresso',
      icon: Shield,
      color: priveTrustProgress?.hasPriveTrust ? 'text-green-600' : 'text-gray-600',
      bgColor: priveTrustProgress?.hasPriveTrust ? 
        'bg-green-100 dark:bg-green-900/20' : 
        'bg-gray-100 dark:bg-gray-900/20',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Sistema de Avaliações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas avaliações e acompanhe seu progresso na comunidade Prive
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="flex items-center p-6">
                <div className={`rounded-full p-2 ${stat.bgColor} mr-4`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conteúdo principal */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pendentes</span>
          </TabsTrigger>
          <TabsTrigger value="prive-trust" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Prive Trust</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Histórico</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingReviewsPanel />
        </TabsContent>

        <TabsContent value="prive-trust">
          <PriveTrustPanel />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              {myReviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Nenhuma avaliação enviada</h3>
                  <p className="text-muted-foreground">
                    Suas avaliações aparecerão aqui após serem enviadas
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myReviews.map((review) => (
                    <Card key={review.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.overall_rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-sm line-clamp-2">{review.description}</p>
                            {review.status === 'pending_publication' && (
                              <p className="text-xs text-orange-600">
                                ⏳ Será publicada em 24h
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}