-- Adicionar campo currency na tabela appointments
ALTER TABLE public.appointments 
ADD COLUMN currency VARCHAR(4) DEFAULT 'BRL';