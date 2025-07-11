import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Star, AlertTriangle, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useReviews, type PendingReview } from '@/hooks/useReviews';

const reviewSchema = z.object({
  overall_rating: z.number().min(1).max(5),
  description: z.string().min(300, 'Descrição deve ter pelo menos 300 caracteres'),
  positive_points: z.string().optional(),
  improvement_points: z.string().optional(),
  negative_points: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  pendingReview: PendingReview;
  onClose: () => void;
}

export const ReviewForm = ({ pendingReview, onClose }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { createReview } = useReviews();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      overall_rating: 0,
      description: '',
      positive_points: '',
      improvement_points: '',
      negative_points: '',
    },
  });

  const description = form.watch('description');
  const progressPercent = Math.min(100, (description.length / 300) * 100);

  const onSubmit = async (data: ReviewFormData) => {
    await createReview.mutateAsync({
      appointment_id: pendingReview.appointment_id,
      reviewer_id: '', // Will be set in the hook
      reviewed_id: pendingReview.reviewed_user_id,
      reviewer_type: pendingReview.review_type,
      overall_rating: data.overall_rating,
      description: data.description,
      positive_points: data.positive_points || undefined,
      improvement_points: data.improvement_points || undefined,
      negative_points: data.negative_points || undefined,
      status: 'pending_publication',
      is_approved: undefined,
    });
    onClose();
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starNumber = i + 1;
      const isActive = starNumber <= (hoveredRating || rating);
      
      return (
        <button
          key={i}
          type="button"
          className={`p-1 transition-colors ${
            isActive ? 'text-yellow-400' : 'text-gray-300'
          }`}
          onMouseEnter={() => setHoveredRating(starNumber)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => {
            setRating(starNumber);
            form.setValue('overall_rating', starNumber);
          }}
        >
          <Star className="w-8 h-8 fill-current" />
        </button>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-2xl font-bold">Avaliação da Experiência</CardTitle>
          <p className="text-muted-foreground">
            Suas palavras constroem a reputação da comunidade.
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Alertas */}
          <div className="space-y-3">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Sua avaliação será publicada em 24h. Você poderá revisá-la antes disso.
              </AlertDescription>
            </Alert>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                A avaliação da outra parte só será visível após você concluir a sua.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Avaliações genéricas reduzem a pontuação do seu perfil. 
                Avaliações ofensivas ou falsas podem levar à suspensão da sua conta.
              </AlertDescription>
            </Alert>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informações do agendamento */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Agendamento</h3>
                  <p className="text-sm text-muted-foreground">
                    {pendingReview.review_type === 'model' ? 
                      `Cliente: ${pendingReview.client_name}` : 
                      `Modelo: ${pendingReview.model_name}`
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Data: {new Date(pendingReview.appointment_date).toLocaleDateString('pt-BR')} às {pendingReview.appointment_time}
                  </p>
                  {pendingReview.service_name && (
                    <p className="text-sm text-muted-foreground">
                      Serviço: {pendingReview.service_name}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Nota geral */}
              <FormField
                control={form.control}
                name="overall_rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Nota Geral *
                    </FormLabel>
                    <FormControl>
                      <div className="flex justify-center">
                        {renderStars()}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Descrição da Experiência *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Descreva sua experiência de forma detalhada e construtiva..."
                        className="min-h-[120px] resize-none"
                        maxLength={2000}
                      />
                    </FormControl>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Mínimo: 300 caracteres</span>
                        <span>{field.value.length}/2000</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pontos positivos */}
              <FormField
                control={form.control}
                name="positive_points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Pontos Positivos
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="O que você mais gostou na experiência?"
                        className="min-h-[80px] resize-none"
                        maxLength={500}
                      />
                    </FormControl>
                    <div className="text-right text-sm text-muted-foreground">
                      {field.value?.length || 0}/500
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pontos de melhoria */}
              <FormField
                control={form.control}
                name="improvement_points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Pontos que Podem Melhorar (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Sugestões construtivas para melhorar a experiência..."
                        className="min-h-[80px] resize-none"
                        maxLength={500}
                      />
                    </FormControl>
                    <div className="text-right text-sm text-muted-foreground">
                      {field.value?.length || 0}/500
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pontos negativos */}
              <FormField
                control={form.control}
                name="negative_points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Pontos Negativos (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Aspectos que não atenderam suas expectativas..."
                        className="min-h-[80px] resize-none"
                        maxLength={500}
                      />
                    </FormControl>
                    <div className="text-right text-sm text-muted-foreground">
                      {field.value?.length || 0}/500
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Barra de progresso para publicação */}
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Publicação Agendada
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Sua avaliação será publicada em 24h após o envio
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botões */}
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createReview.isPending || rating === 0 || description.length < 300}
                >
                  {createReview.isPending ? 'Enviando...' : 'Enviar Avaliação'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};