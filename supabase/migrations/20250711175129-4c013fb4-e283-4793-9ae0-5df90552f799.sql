-- Adicionar campo para controlar quais tipos de usuário podem usar cada ferramenta
ALTER TABLE public.lunna_tools 
ADD COLUMN allowed_user_types TEXT[] DEFAULT ARRAY['admin', 'modelo', 'cliente'];

-- Atualizar ferramentas existentes com permissões específicas
UPDATE public.lunna_tools 
SET allowed_user_types = ARRAY['admin'] 
WHERE name IN ('estatisticas_prive');

UPDATE public.lunna_tools 
SET allowed_user_types = ARRAY['admin', 'modelo'] 
WHERE name IN ('buscar_modelos_geral');

-- Manter permissão para todos nas demais ferramentas
UPDATE public.lunna_tools 
SET allowed_user_types = ARRAY['admin', 'modelo', 'cliente'] 
WHERE name IN ('buscar_modelos', 'salvar_preferencias_usuario', 'buscar_preferencias_usuario');