import { useState } from 'react';
import { Plus, Target, Calendar, Award, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGoals, useDeleteGoal } from '@/hooks/useGoals';
import GoalForm from './GoalForm';

const GoalsManager = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const { data: goals = [], isLoading } = useGoals();
  const deleteGoal = useDeleteGoal();

  const getGoalTypeLabel = (type: string) => {
    const types = {
      work_hours: 'Horas Trabalhadas',
      appointments: 'Agendamentos',
      points: 'Pontuação',
      platform_access: 'Acesso à Plataforma',
      content_delivery: 'Entrega de Conteúdo',
      live_minutes: 'Minutos de Live'
    };
    return types[type] || type;
  };

  const getPeriodTypeLabel = (type: string) => {
    const types = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal'
    };
    return types[type] || type;
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleDelete = (goalId: string) => {
    if (confirm('Tem certeza que deseja deletar esta meta?')) {
      deleteGoal.mutate(goalId);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGoal(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-zinc-400">Carregando metas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciar Metas</h2>
          <p className="text-zinc-400">Configure metas para modelos e acompanhe o progresso</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <Card key={goal.id} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-white text-lg">{goal.title}</CardTitle>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(goal)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(goal.id)}
                    className="text-zinc-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {goal.description && (
                <p className="text-zinc-400 text-sm">{goal.description}</p>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                  {getGoalTypeLabel(goal.goal_type)}
                </Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  {getPeriodTypeLabel(goal.period_type)}
                </Badge>
                {goal.admin_defined && (
                  <Badge className="bg-blue-600 text-white">Admin</Badge>
                )}
              </div>

              {goal.model && (
                <div className="flex items-center space-x-2 text-sm text-zinc-400">
                  <span>Modelo:</span>
                  <span className="text-white">{goal.model.name}</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Progresso</span>
                  <span className="text-white">
                    {goal.current_value} / {goal.target_value}
                  </span>
                </div>
                <Progress 
                  value={getProgressPercentage(goal.current_value, goal.target_value)} 
                  className="h-2"
                />
                <div className="text-xs text-zinc-500 text-right">
                  {getProgressPercentage(goal.current_value, goal.target_value).toFixed(1)}%
                </div>
              </div>

              {goal.period_start && goal.period_end && (
                <div className="flex items-center space-x-2 text-sm text-zinc-400">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(goal.period_start).toLocaleDateString()} - {new Date(goal.period_end).toLocaleDateString()}
                  </span>
                </div>
              )}

              {goal.reward_points && (
                <div className="flex items-center space-x-2 text-sm text-amber-400">
                  <Award className="h-4 w-4" />
                  <span>{goal.reward_points} pontos de recompensa</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div className="flex items-center space-x-2 text-xs text-zinc-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>
                    {goal.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(goal.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {goals.length === 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Nenhuma meta criada</h3>
            <p className="text-zinc-400 text-center mb-4">
              Comece criando metas para acompanhar o desempenho dos modelos
            </p>
            <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Criar primeira meta
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingGoal ? 'Editar Meta' : 'Nova Meta'}
            </DialogTitle>
          </DialogHeader>
          <GoalForm 
            goal={editingGoal} 
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalsManager;