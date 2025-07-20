-- Remove model_id from clients table as it was incorrectly added
ALTER TABLE public.clients DROP COLUMN IF EXISTS model_id;