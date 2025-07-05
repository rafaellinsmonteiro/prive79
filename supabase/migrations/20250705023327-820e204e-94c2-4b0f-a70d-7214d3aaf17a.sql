-- Adicionar política RLS para permitir que modelos deletem seus próprios dados
CREATE POLICY "Models can delete their own model data" 
ON public.models 
FOR DELETE 
USING (id IN ( 
  SELECT model_profiles.model_id
  FROM model_profiles
  WHERE (model_profiles.user_id = auth.uid())
));