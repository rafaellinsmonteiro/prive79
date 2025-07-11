-- Criar tabela de avaliações
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  reviewed_id UUID NOT NULL,
  reviewer_type TEXT NOT NULL CHECK (reviewer_type IN ('model', 'client')),
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  description TEXT NOT NULL CHECK (char_length(description) >= 300),
  positive_points TEXT,
  improvement_points TEXT,
  negative_points TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_publication', 'published')),
  is_approved BOOLEAN DEFAULT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de pontos de experiência (PXP)
CREATE TABLE public.user_pxp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_points INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Criar tabela de transações de PXP
CREATE TABLE public.pxp_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('review_received', 'review_penalty', 'level_bonus')),
  description TEXT,
  review_id UUID REFERENCES reviews(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de status do Prive Trust
CREATE TABLE public.prive_trust_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  reviews_received_count INTEGER NOT NULL DEFAULT 0,
  reviews_sent_count INTEGER NOT NULL DEFAULT 0,
  reviews_sent_approved INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT NULL,
  identity_verified BOOLEAN NOT NULL DEFAULT false,
  has_prive_trust BOOLEAN NOT NULL DEFAULT false,
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pxp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pxp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prive_trust_status ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para reviews
CREATE POLICY "Users can view reviews they are involved in" 
ON public.reviews FOR SELECT 
USING (reviewer_id = auth.uid() OR reviewed_id = auth.uid());

CREATE POLICY "Users can create reviews for their appointments" 
ON public.reviews FOR INSERT 
WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update their own draft reviews" 
ON public.reviews FOR UPDATE 
USING (reviewer_id = auth.uid() AND status = 'draft');

CREATE POLICY "Admins can manage all reviews" 
ON public.reviews FOR ALL 
USING (is_admin());

-- Políticas RLS para user_pxp
CREATE POLICY "Users can view their own PXP" 
ON public.user_pxp FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own PXP record" 
ON public.user_pxp FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update PXP" 
ON public.user_pxp FOR UPDATE 
USING (true);

CREATE POLICY "Admins can manage all PXP" 
ON public.user_pxp FOR ALL 
USING (is_admin());

-- Políticas RLS para pxp_transactions
CREATE POLICY "Users can view their own PXP transactions" 
ON public.pxp_transactions FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can create PXP transactions" 
ON public.pxp_transactions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage all PXP transactions" 
ON public.pxp_transactions FOR ALL 
USING (is_admin());

-- Políticas RLS para prive_trust_status
CREATE POLICY "Users can view their own Prive Trust status" 
ON public.prive_trust_status FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own Prive Trust status" 
ON public.prive_trust_status FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update Prive Trust status" 
ON public.prive_trust_status FOR UPDATE 
USING (true);

CREATE POLICY "Admins can manage all Prive Trust status" 
ON public.prive_trust_status FOR ALL 
USING (is_admin());

-- Função para calcular nível baseado em pontos
CREATE OR REPLACE FUNCTION public.calculate_level(points INTEGER)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN points < 100 THEN 1
    WHEN points < 300 THEN 2
    WHEN points < 600 THEN 3
    WHEN points < 1000 THEN 4
    WHEN points < 1500 THEN 5
    ELSE 5 + ((points - 1500) / 500)
  END;
$$;

-- Função para processar pontos de avaliação
CREATE OR REPLACE FUNCTION public.process_review_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  points_to_add INTEGER := 0;
  user_record RECORD;
  new_level INTEGER;
BEGIN
  -- Só processar quando review for publicada
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    -- Determinar pontos baseado na nota (apenas para modelos)
    SELECT user_role INTO user_record 
    FROM system_users 
    WHERE user_id = NEW.reviewed_id;
    
    IF user_record.user_role = 'modelo' THEN
      IF NEW.overall_rating = 5 THEN
        points_to_add := 25;
      ELSE
        points_to_add := -100;
      END IF;
      
      -- Inserir ou atualizar PXP do usuário
      INSERT INTO user_pxp (user_id, current_points, total_earned)
      VALUES (NEW.reviewed_id, points_to_add, GREATEST(points_to_add, 0))
      ON CONFLICT (user_id) DO UPDATE SET
        current_points = user_pxp.current_points + points_to_add,
        total_earned = user_pxp.total_earned + GREATEST(points_to_add, 0),
        updated_at = now();
      
      -- Atualizar nível
      SELECT current_points INTO user_record FROM user_pxp WHERE user_id = NEW.reviewed_id;
      new_level := calculate_level(user_record.current_points);
      
      UPDATE user_pxp 
      SET current_level = new_level 
      WHERE user_id = NEW.reviewed_id;
      
      -- Registrar transação
      INSERT INTO pxp_transactions (user_id, points, transaction_type, description, review_id)
      VALUES (
        NEW.reviewed_id, 
        points_to_add, 
        CASE WHEN points_to_add > 0 THEN 'review_received' ELSE 'review_penalty' END,
        CASE WHEN points_to_add > 0 THEN 'Avaliação 5 estrelas recebida' ELSE 'Penalidade por avaliação baixa' END,
        NEW.id
      );
    END IF;
    
    -- Atualizar status do Prive Trust para ambos os usuários
    -- Para o avaliado
    INSERT INTO prive_trust_status (user_id, reviews_received_count, average_rating)
    VALUES (NEW.reviewed_id, 1, NEW.overall_rating)
    ON CONFLICT (user_id) DO UPDATE SET
      reviews_received_count = prive_trust_status.reviews_received_count + 1,
      average_rating = (
        (prive_trust_status.average_rating * (prive_trust_status.reviews_received_count - 1) + NEW.overall_rating) 
        / prive_trust_status.reviews_received_count
      ),
      updated_at = now();
    
    -- Para o avaliador
    INSERT INTO prive_trust_status (user_id, reviews_sent_count, reviews_sent_approved)
    VALUES (NEW.reviewer_id, 1, CASE WHEN NEW.is_approved = true THEN 1 ELSE 0 END)
    ON CONFLICT (user_id) DO UPDATE SET
      reviews_sent_count = prive_trust_status.reviews_sent_count + 1,
      reviews_sent_approved = prive_trust_status.reviews_sent_approved + 
        CASE WHEN NEW.is_approved = true THEN 1 ELSE 0 END,
      updated_at = now();
      
    -- Verificar se o usuário conquistou o Prive Trust
    UPDATE prive_trust_status 
    SET 
      has_prive_trust = true,
      achieved_at = CASE WHEN has_prive_trust = false THEN now() ELSE achieved_at END
    WHERE user_id = NEW.reviewed_id 
      AND reviews_received_count >= 5 
      AND average_rating >= 4.5 
      AND identity_verified = true
      AND has_prive_trust = false;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para processar pontos automaticamente
CREATE TRIGGER process_review_points_trigger
  AFTER UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION process_review_points();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_pxp_updated_at
  BEFORE UPDATE ON user_pxp
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prive_trust_status_updated_at
  BEFORE UPDATE ON prive_trust_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();