-- Adicionar políticas RLS para DELETE nas tabelas que estavam sem permissão

-- Serviços: Modelos podem deletar seus próprios serviços
CREATE POLICY "Models can delete their own services" 
ON public.services 
FOR DELETE 
USING (model_id IN ( 
  SELECT model_profiles.model_id
  FROM model_profiles
  WHERE ((model_profiles.user_id = auth.uid()) AND (model_profiles.is_active = true))
));

-- Clientes: Modelos podem deletar seus próprios clientes
CREATE POLICY "Models can delete their own clients" 
ON public.clients 
FOR DELETE 
USING (model_id IN ( 
  SELECT model_profiles.model_id
  FROM model_profiles
  WHERE ((model_profiles.user_id = auth.uid()) AND (model_profiles.is_active = true))
));

-- Agendamentos: Modelos podem deletar seus próprios agendamentos
CREATE POLICY "Models can delete their own appointments" 
ON public.appointments 
FOR DELETE 
USING (model_id IN ( 
  SELECT model_profiles.model_id
  FROM model_profiles
  WHERE ((model_profiles.user_id = auth.uid()) AND (model_profiles.is_active = true))
));