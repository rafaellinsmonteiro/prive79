
-- Cria a nova tabela 'cities' para armazenar as cidades
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  state VARCHAR(2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cities_name_state_unique UNIQUE (name, state)
);

-- Adiciona as colunas 'city_id' e 'neighborhood' na tabela 'models'
ALTER TABLE public.models
ADD COLUMN city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
ADD COLUMN neighborhood TEXT;

-- Insere "Aracaju" na tabela de cidades
INSERT INTO public.cities (name, state) VALUES ('Aracaju', 'SE');

-- Atualiza todos os modelos existentes para terem a cidade "Aracaju"
DO $$
DECLARE
  aracaju_id UUID;
BEGIN
  -- Pega o ID da cidade de Aracaju que acabamos de inserir
  SELECT id INTO aracaju_id FROM public.cities WHERE name = 'Aracaju' AND state = 'SE' LIMIT 1;
  
  -- Se o ID foi encontrado, atualiza todos os modelos
  IF aracaju_id IS NOT NULL THEN
    UPDATE public.models SET city_id = aracaju_id;
  END IF;
END $$;

-- Remove a antiga coluna de 'location' que não será mais usada
ALTER TABLE public.models
DROP COLUMN location;

-- Habilita Row Level Security para a nova tabela
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Permite que qualquer pessoa (autenticada ou não) leia as cidades ativas
CREATE POLICY "Public can read active cities"
ON public.cities
FOR SELECT
USING (is_active = true);

-- Permite que apenas administradores criem, atualizem ou apaguem cidades
CREATE POLICY "Admins have full access to cities"
ON public.cities
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

