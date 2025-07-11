import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Target, Plus, TrendingUp, Calendar, Trophy, Users, Clock, Star } from 'lucide-react';
import { useGoals, useUpdateGoalProgress, Goal } from '@/hooks/useGoals';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ModelGoalsProps {
  modelId: string;
}

const ModelGoals = ({ modelId }: ModelGoalsProps) => {
  const { data: goals = [], isLoading } = useGoals(modelId);
  const updateProgress = useUpdateGoalProgress();
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [progressValue, setProgressValue] = useState('');
  const [progressNotes, setProgressNotes] = useState('');

  // As metas já vêm filtradas do hook
  const modelGoals = goals;

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'work_hours': return <Clock className="h-4 w-4" />;
      case 'appointments': return <Users className="h-4 w-4" />;
      case 'points': return <Star className="h-4 w-4" />;
      case 'platform_access': return <TrendingUp className="h-4 w-4" />;
      case 'content_delivery': return <Trophy className="h-4 w-4" />;
      case 'live_minutes': return <Calendar className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'work_hours': return 'Horas Trabalhadas';
      case 'appointments': return 'Agendamentos';
      case 'points': return 'Pontos';
      case 'platform_access': return 'Acessos à Plataforma';
      case 'content_delivery': return 'Entrega de Conteúdo';
      case 'live_minutes': return 'Minutos de Live';
      default: return type;
    }
  };

  const getPeriodLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Diário';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      default: return type;
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleUpdateProgress = async () => {
    if (!selectedGoal || !progressValue) {
      toast.error('Preencha o valor do progresso');
      return;
    }

    try {
      await updateProgress.mutateAsync({
        goalId: selectedGoal.id,
        progressValue: Number(progressValue),
        notes: progressNotes || undefined,
      });

      setProgressDialogOpen(false);
      setSelectedGoal(null);
      setProgressValue('');
      setProgressNotes('');
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center text-zinc-400">Carregando metas...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Minhas Metas</h1>
          <p className="text-zinc-400">Acompanhe e atualize suas metas de desempenho</p>
        </div>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-400" />
          <span className="text-sm text-zinc-400">{modelGoals.length} metas ativas</span>
        </div>
      </div>

      {modelGoals.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Nenhuma meta encontrada</h3>
            <p className="text-zinc-400 text-center">
              Ainda não há metas definidas para você. Entre em contato com a administração.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {modelGoals.map((goal) => {
            const progressPercentage = getProgressPercentage(goal.current_value, goal.target_value);
            const isCompleted = goal.current_value >= goal.target_value;

            return (
              <Card key={goal.id} className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        {getGoalTypeIcon(goal.goal_type)}
                      </div>
                      <div>
                        <CardTitle className="text-white">{goal.title}</CardTitle>
                        {goal.description && (
                          <p className="text-sm text-zinc-400 mt-1">{goal.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isCompleted ? "default" : "secondary"}>
                        {getGoalTypeLabel(goal.goal_type)}
                      </Badge>
                      <Badge variant="outline">
                        {getPeriodLabel(goal.period_type)}
                      </Badge>
                      {goal.admin_defined && (
                        <Badge variant="destructive" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Progresso</span>
                      <span className="text-white">
                        {goal.current_value} / {goal.target_value}
                        {goal.goal_type === 'work_hours' && ' horas'}
                        {goal.goal_type === 'appointments' && ' agendamentos'}
                        {goal.goal_type === 'points' && ' pontos'}
                        {goal.goal_type === 'platform_access' && ' acessos'}
                        {goal.goal_type === 'content_delivery' && ' conteúdos'}
                        {goal.goal_type === 'live_minutes' && ' minutos'}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>{progressPercentage.toFixed(1)}% concluído</span>
                      {isCompleted && (
                        <span className="text-green-400 flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          Meta concluída!
                        </span>
                      )}
                    </div>
                  </div>

                  {goal.period_start && goal.period_end && (
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Período: {format(new Date(goal.period_start), 'dd/MM/yyyy')} - {format(new Date(goal.period_end), 'dd/MM/yyyy')}
                      </div>
                    </div>
                  )}

                  {goal.reward_points && goal.reward_points > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-zinc-400">Recompensa:</span>
                      <span className="text-white">{goal.reward_points} pontos</span>
                      {goal.reward_description && (
                        <span className="text-zinc-400">- {goal.reward_description}</span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Dialog open={progressDialogOpen && selectedGoal?.id === goal.id} onOpenChange={setProgressDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedGoal(goal);
                            setProgressValue(goal.current_value.toString());
                          }}
                          disabled={isCompleted}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Atualizar Progresso
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-900 border-zinc-800">
                        <DialogHeader>
                          <DialogTitle className="text-white">Atualizar Progresso - {goal.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="progress-value" className="text-zinc-300">
                              Valor Atual
                            </Label>
                            <Input
                              id="progress-value"
                              type="number"
                              value={progressValue}
                              onChange={(e) => setProgressValue(e.target.value)}
                              className="bg-zinc-800 border-zinc-700 text-white"
                              min="0"
                              max={goal.target_value}
                            />
                          </div>
                          <div>
                            <Label htmlFor="progress-notes" className="text-zinc-300">
                              Observações (opcional)
                            </Label>
                            <Textarea
                              id="progress-notes"
                              value={progressNotes}
                              onChange={(e) => setProgressNotes(e.target.value)}
                              className="bg-zinc-800 border-zinc-700 text-white"
                              placeholder="Adicione observações sobre este progresso..."
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setProgressDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleUpdateProgress} disabled={updateProgress.isPending}>
                              {updateProgress.isPending ? 'Salvando...' : 'Salvar'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModelGoals;