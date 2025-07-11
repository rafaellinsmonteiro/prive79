import { Shield, Star, CheckCircle, XCircle, AlertCircle, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePriveTrust } from '@/hooks/usePriveTrust';

export const PriveTrustPanel = () => {
  const { getPriveTrustProgress, getLevelInfo, loadingStatus } = usePriveTrust();

  const priveTrustProgress = getPriveTrustProgress();
  const levelInfo = getLevelInfo();

  if (loadingStatus || !priveTrustProgress || !levelInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Prive Trust</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const criteriaItems = [
    {
      label: 'Avaliações Recebidas',
      current: priveTrustProgress.reviewsReceived,
      required: 5,
      completed: priveTrustProgress.reviewsReceivedNeeded === 0,
      icon: Star,
    },
    {
      label: 'Avaliações Enviadas Aprovadas',
      current: priveTrustProgress.reviewsSent,
      required: 5,
      completed: priveTrustProgress.reviewsSentNeeded === 0,
      icon: CheckCircle,
    },
    {
      label: 'Média de Avaliações',
      current: priveTrustProgress.averageRating,
      required: 4.5,
      completed: priveTrustProgress.averageOk,
      icon: TrendingUp,
      isAverage: true,
    },
    {
      label: 'Verificação de Identidade',
      current: priveTrustProgress.identityVerified ? 1 : 0,
      required: 1,
      completed: priveTrustProgress.identityVerified,
      icon: Shield,
      isBoolean: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status do Prive Trust */}
      <Card className={priveTrustProgress.hasPriveTrust ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Shield className={`h-5 w-5 ${priveTrustProgress.hasPriveTrust ? 'text-green-600' : 'text-muted-foreground'}`} />
              <span>Status Prive Trust</span>
            </CardTitle>
            {priveTrustProgress.hasPriveTrust && (
              <Badge className="bg-green-600 hover:bg-green-700">
                <Award className="h-3 w-3 mr-1" />
                Conquistado
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {priveTrustProgress.hasPriveTrust ? (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Parabéns! Você conquistou o selo Prive Trust em{' '}
                {priveTrustProgress.achievedAt && 
                  new Date(priveTrustProgress.achievedAt).toLocaleDateString('pt-BR')
                }. Sua reputação na comunidade está estabelecida.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Complete todos os critérios abaixo para conquistar o selo Prive Trust e 
                fortalecer sua reputação na plataforma.
              </AlertDescription>
            </Alert>
          )}

          {/* Critérios */}
          <div className="grid gap-4 md:grid-cols-2">
            {criteriaItems.map((item) => {
              const Icon = item.icon;
              let displayValue = '';
              let progressPercent = 0;

              if (item.isBoolean) {
                displayValue = item.completed ? 'Verificado' : 'Pendente';
                progressPercent = item.completed ? 100 : 0;
              } else if (item.isAverage) {
                displayValue = item.current > 0 ? item.current.toFixed(1) : '0.0';
                progressPercent = Math.min(100, (item.current / item.required) * 100);
              } else {
                displayValue = `${item.current}/${item.required}`;
                progressPercent = Math.min(100, (item.current / item.required) * 100);
              }

              return (
                <Card key={item.label} className={`${item.completed ? 'border-green-200 bg-green-50/50 dark:bg-green-950/10' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${item.completed ? 'text-green-600' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {item.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{displayValue}</span>
                        <span className="text-muted-foreground">
                          {item.isAverage ? `≥${item.required}` : item.required}
                        </span>
                      </div>
                      <Progress 
                        value={progressPercent} 
                        className={`h-2 ${item.completed ? 'bg-green-100' : ''}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {!priveTrustProgress.hasPriveTrust && (
            <div className="pt-4">
              <Button className="w-full" variant="outline">
                Ver Critérios Detalhados do Prive Trust
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nível e PXP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Nível e Experiência</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Nível {levelInfo.currentLevel}</h3>
              <p className="text-muted-foreground">
                {levelInfo.currentPoints.toLocaleString()} PXP
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {levelInfo.totalEarned.toLocaleString()} PXP Total
            </Badge>
          </div>

          {levelInfo.currentLevel < 10 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso para o próximo nível</span>
                <span>{levelInfo.pointsToNext.toLocaleString()} PXP restantes</span>
              </div>
              <Progress value={levelInfo.progressPercent} className="h-3" />
            </div>
          )}

          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Avaliações 5 estrelas rendem +25 PXP. Avaliações abaixo de 5 estrelas resultam em -100 PXP.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};