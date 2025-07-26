-- Criar um chat_user especial para a Lunna IA
INSERT INTO public.chat_users (
  id,
  user_id,
  chat_display_name,
  username,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  NULL, -- Não tem user_id real pois é uma IA
  'Lunna IA',
  'lunna',
  true
) ON CONFLICT (id) DO UPDATE SET
  chat_display_name = EXCLUDED.chat_display_name,
  username = EXCLUDED.username,
  is_active = EXCLUDED.is_active;