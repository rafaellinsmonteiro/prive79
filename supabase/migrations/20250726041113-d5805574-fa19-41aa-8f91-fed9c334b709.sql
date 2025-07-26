-- Adicionar a coluna 'teste' que está faltando na tabela models
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS teste text;