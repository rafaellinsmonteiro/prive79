
-- Primeiro, vamos identificar e manter apenas a conversa mais antiga para cada par usuário-modelo
WITH duplicates AS (
  SELECT 
    user_id, 
    model_id,
    array_agg(id ORDER BY created_at ASC) as conversation_ids
  FROM public.conversations 
  WHERE model_id IS NOT NULL
  GROUP BY user_id, model_id
  HAVING COUNT(*) > 1
)
DELETE FROM public.conversations 
WHERE id IN (
  SELECT unnest(conversation_ids[2:]) 
  FROM duplicates
);

-- Agora podemos adicionar a constraint única
ALTER TABLE public.conversations 
ADD CONSTRAINT unique_user_model_conversation 
UNIQUE (user_id, model_id);

-- Adicionar colunas para última mensagem
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS last_message_content TEXT,
ADD COLUMN IF NOT EXISTS last_message_type message_type DEFAULT 'text';

-- Criar função para atualizar a última mensagem na conversa
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.conversations 
  SET 
    last_message_at = NEW.created_at,
    last_message_content = CASE 
      WHEN NEW.message_type = 'text' THEN NEW.content
      WHEN NEW.message_type = 'audio' THEN 'Mensagem de áudio'
      WHEN NEW.message_type = 'image' THEN 'Imagem'
      WHEN NEW.message_type = 'video' THEN 'Vídeo'
      ELSE 'Arquivo'
    END,
    last_message_type = NEW.message_type,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

-- Criar trigger para atualizar automaticamente quando uma nova mensagem é inserida
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON public.messages;
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();

-- Atualizar conversas existentes com a última mensagem
UPDATE public.conversations 
SET 
  last_message_content = (
    SELECT CASE 
      WHEN m.message_type = 'text' THEN m.content
      WHEN m.message_type = 'audio' THEN 'Mensagem de áudio'
      WHEN m.message_type = 'image' THEN 'Imagem'
      WHEN m.message_type = 'video' THEN 'Vídeo'
      ELSE 'Arquivo'
    END
    FROM public.messages m
    WHERE m.conversation_id = conversations.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ),
  last_message_type = (
    SELECT m.message_type
    FROM public.messages m
    WHERE m.conversation_id = conversations.id
    ORDER BY m.created_at DESC
    LIMIT 1
  )
WHERE EXISTS (
  SELECT 1 FROM public.messages m 
  WHERE m.conversation_id = conversations.id
);
