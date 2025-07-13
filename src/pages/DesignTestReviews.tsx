import DesignTestLayout from '@/components/design-test/DesignTestLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingReviewsPanel } from '@/components/reviews/PendingReviewsPanel';
import { PriveTrustPanel } from '@/components/reviews/PriveTrustPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Clock, Shield, TrendingUp } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { usePriveTrust } from '@/hooks/usePriveTrust';

export default function DesignTestReviews() {
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
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
    },
    {
      title: 'Avaliações Enviadas',
      value: myReviews.length,
      icon: Star,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      title: 'Nível Atual',
      value: levelInfo?.currentLevel || 1,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      title: 'Status Prive Trust',
      value: priveTrustProgress?.hasPriveTrust ? 'Conquistado' : 'Em Progresso',
      icon: Shield,
      color: priveTrustProgress?.hasPriveTrust ? 'text-green-400' : 'text-[hsl(var(--dark-muted))]',
      bgColor: priveTrustProgress?.hasPriveTrust ? 
        'bg-green-500/20' : 
        'bg-[hsl(var(--dark-muted))]/20',
    },
  ];

  return (
    <DesignTestLayout title="Reviews">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--gold-primary))]">Sistema de Avaliações</h1>
          <p className="text-[hsl(var(--dark-muted))] mt-2">
            Gerencie suas avaliações e acompanhe seu progresso na comunidade Prive
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
                <CardContent className="flex items-center p-6">
                  <div className={`rounded-full p-2 ${stat.bgColor} mr-4`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--dark-muted))]">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-[hsl(var(--dark-text))]">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Conteúdo principal */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-[hsl(var(--dark-card))] border border-[hsl(var(--gold-accent))]/20">
            <TabsTrigger 
              value="pending" 
              className="flex items-center space-x-2 data-[state=active]:bg-[hsl(var(--gold-primary))]/20 data-[state=active]:text-[hsl(var(--gold-primary))]"
            >
              <Clock className="h-4 w-4" />
              <span>Pendentes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="prive-trust" 
              className="flex items-center space-x-2 data-[state=active]:bg-[hsl(var(--gold-primary))]/20 data-[state=active]:text-[hsl(var(--gold-primary))]"
            >
              <Shield className="h-4 w-4" />
              <span>Prive Trust</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center space-x-2 data-[state=active]:bg-[hsl(var(--gold-primary))]/20 data-[state=active]:text-[hsl(var(--gold-primary))]"
            >
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
            <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--gold-primary))]">Histórico de Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                {myReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-[hsl(var(--dark-muted))] mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2 text-[hsl(var(--dark-text))]">Nenhuma avaliação enviada</h3>
                    <p className="text-[hsl(var(--dark-muted))]">
                      Suas avaliações aparecerão aqui após serem enviadas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myReviews.map((review) => (
                      <Card key={review.id} className="bg-[hsl(var(--dark-primary))] border-l-4 border-l-[hsl(var(--gold-primary))] border-[hsl(var(--gold-accent))]/20">
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
                                          : 'text-[hsl(var(--dark-muted))]'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-[hsl(var(--dark-muted))]">
                                  {new Date(review.created_at).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-sm line-clamp-2 text-[hsl(var(--dark-text))]">{review.description}</p>
                              {review.status === 'pending_publication' && (
                                <p className="text-xs text-orange-400">
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
    </DesignTestLayout>
  );
}