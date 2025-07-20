-- Drop the policies that depend on model_id column
DROP POLICY IF EXISTS "Models can manage their own clients" ON public.clients;
DROP POLICY IF EXISTS "Models can delete their own clients" ON public.clients;

-- Now drop the model_id column
ALTER TABLE public.clients DROP COLUMN IF EXISTS model_id;