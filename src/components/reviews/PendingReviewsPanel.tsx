import { useState } from 'react';
import { Calendar, Clock, Star, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReviews } from '@/hooks/useReviews';
import { usePriveTrust } from '@/hooks/usePriveTrust';
import { ReviewForm } from './ReviewForm';
import type { PendingReview } from '@/hooks/useReviews';

export const PendingReviewsPanel = () => {
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);
  const { pendingReviews, loadingPending } = useReviews();
  const { getPriveTrustProgress } = usePriveTrust();

  const priveTrustProgress = getPriveTrustProgress();

  if (loadingPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Avaliações Pendentes</CardTitle>
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

  const pendingCount = pendingReviews.length;
  const reviewsNeededForTrust = priveTrustProgress?.reviewsReceivedNeeded || 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Avaliações Pendentes</span>
            </CardTitle>
            {pendingCount > 0 && (
              <Badge variant="destructive">{pendingCount}</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Alerta sobre Prive Trust */}
          {!priveTrustProgress?.hasPriveTrust && reviewsNeededForTrust > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Você precisa receber <strong>{reviewsNeededForTrust} avaliações</strong> para conquistar o Prive Trust.
                Complete as avaliações pendentes para acelerar o processo!
              </AlertDescription>
            </Alert>
          )}

          {pendingCount === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhuma avaliação pendente</h3>
              <p className="text-muted-foreground">
                Você está em dia com suas avaliações! 🎉
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviews.map((review) => (
                <Card key={review.appointment_id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            {review.review_type === 'model' ? 'Cliente' : 'Modelo'}
                          </Badge>
                          <h4 className="font-medium">
                            {review.review_type === 'model' 
                              ? review.client_name 
                              : review.model_name}
                          </h4>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(review.appointment_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{review.appointment_time}</span>
                          </div>
                        </div>

                        {review.service_name && (
                          <p className="text-sm text-muted-foreground">
                            Serviço: {review.service_name}
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={() => setSelectedReview(review)}
                        className="shrink-0"
                      >
                        Avaliar Agora
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de avaliação */}
      {selectedReview && (
        <ReviewForm
          pendingReview={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </>
  );
};