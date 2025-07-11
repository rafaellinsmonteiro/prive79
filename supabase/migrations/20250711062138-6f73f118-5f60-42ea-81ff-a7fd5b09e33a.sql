-- Criar tabela para as metas
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID REFERENCES public.models(id) ON DELETE CASCADE,
  admin_defined BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  goal_type TEXT NOT NULL, -- 'work_hours', 'appointments', 'points', 'platform_access', 'content_delivery', 'live_minutes'
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL DEFAULT 0,
  period_type TEXT NOT NULL DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly'
  period_start DATE,
  period_end DATE,
  appointment_types TEXT[], -- Para metas de agendamento específico
  content_formats TEXT[], -- Para metas de conteúdo
  reward_points INTEGER DEFAULT 0,
  reward_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by_user_id UUID REFERENCES auth.users(id)
);

-- Tabela para histórico de progresso das metas
CREATE TABLE public.goal_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  progress_date DATE NOT NULL DEFAULT CURRENT_DATE,
  progress_value NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para goals
CREATE POLICY "Admins can manage all goals" 
ON public.goals 
FOR ALL 
USING (is_admin());

CREATE POLICY "Models can view their own goals" 
ON public.goals 
FOR SELECT 
USING (
  model_id IN (
    SELECT model_profiles.model_id 
    FROM model_profiles 
    WHERE model_profiles.user_id = auth.uid() 
    AND model_profiles.is_active = true
  )
);

CREATE POLICY "Models can create their own goals when not admin defined" 
ON public.goals 
FOR INSERT 
WITH CHECK (
  admin_defined = false 
  AND model_id IN (
    SELECT model_profiles.model_id 
    FROM model_profiles 
    WHERE model_profiles.user_id = auth.uid() 
    AND model_profiles.is_active = true
  )
);

CREATE POLICY "Models can update their own non-admin goals" 
ON public.goals 
FOR UPDATE 
USING (
  admin_defined = false 
  AND model_id IN (
    SELECT model_profiles.model_id 
    FROM model_profiles 
    WHERE model_profiles.user_id = auth.uid() 
    AND model_profiles.is_active = true
  )
);

-- Políticas RLS para goal_progress
CREATE POLICY "Admins can manage all goal progress" 
ON public.goal_progress 
FOR ALL 
USING (is_admin());

CREATE POLICY "Models can view their goals progress" 
ON public.goal_progress 
FOR SELECT 
USING (
  goal_id IN (
    SELECT goals.id 
    FROM goals 
    WHERE goals.model_id IN (
      SELECT model_profiles.model_id 
      FROM model_profiles 
      WHERE model_profiles.user_id = auth.uid() 
      AND model_profiles.is_active = true
    )
  )
);

CREATE POLICY "System can create goal progress" 
ON public.goal_progress 
FOR INSERT 
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_goals_model_id ON public.goals(model_id);
CREATE INDEX idx_goals_goal_type ON public.goals(goal_type);
CREATE INDEX idx_goals_period ON public.goals(period_start, period_end);
CREATE INDEX idx_goal_progress_goal_id ON public.goal_progress(goal_id);
CREATE INDEX idx_goal_progress_date ON public.goal_progress(progress_date);