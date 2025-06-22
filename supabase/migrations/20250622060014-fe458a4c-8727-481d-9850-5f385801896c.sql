
-- Atualizar a tabela system_users para ter referência ao plano
ALTER TABLE public.system_users 
ADD CONSTRAINT fk_system_users_plan FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE SET NULL;

-- Criar função para verificar se o usuário tem acesso baseado no plano
CREATE OR REPLACE FUNCTION public.user_has_plan_access(_user_id uuid, _allowed_plan_ids uuid[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT CASE
    -- Se não há restrições de plano, permitir acesso
    WHEN _allowed_plan_ids IS NULL OR array_length(_allowed_plan_ids, 1) IS NULL THEN true
    -- Se há restrições, verificar se o usuário tem um plano permitido
    ELSE EXISTS (
      SELECT 1 
      FROM public.system_users su
      WHERE su.user_id = _user_id 
        AND su.plan_id = ANY(_allowed_plan_ids)
        AND su.is_active = true
    )
  END;
$$;

-- Criar função para obter o plano do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_plan()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT plan_id 
  FROM public.system_users 
  WHERE user_id = auth.uid() 
    AND is_active = true
  LIMIT 1;
$$;

-- Comentários para documentar as funções
COMMENT ON FUNCTION public.user_has_plan_access IS 'Verifica se um usuário tem acesso baseado nos planos permitidos';
COMMENT ON FUNCTION public.get_current_user_plan IS 'Retorna o ID do plano do usuário atual';
