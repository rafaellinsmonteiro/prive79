-- Criar tabela de contas PriveBank
CREATE TABLE public.privabank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT privabank_accounts_user_id_unique UNIQUE(user_id),
  CONSTRAINT privabank_accounts_balance_non_negative CHECK (balance >= 0)
);

-- Criar tabela de transações PriveBank
CREATE TABLE public.privabank_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_account_id UUID NULL,
  to_account_id UUID NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer')),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT privabank_transactions_amount_positive CHECK (amount > 0),
  CONSTRAINT privabank_transactions_from_account_fkey FOREIGN KEY (from_account_id) REFERENCES public.privabank_accounts(id),
  CONSTRAINT privabank_transactions_to_account_fkey FOREIGN KEY (to_account_id) REFERENCES public.privabank_accounts(id)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.privabank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privabank_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para privabank_accounts
CREATE POLICY "Admins can manage all privabank accounts"
  ON public.privabank_accounts
  FOR ALL
  USING (is_admin());

CREATE POLICY "Users can view their own privabank account"
  ON public.privabank_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Políticas RLS para privabank_transactions
CREATE POLICY "Admins can manage all privabank transactions"
  ON public.privabank_transactions
  FOR ALL
  USING (is_admin());

CREATE POLICY "Users can view their own privabank transactions"
  ON public.privabank_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.privabank_accounts 
      WHERE (id = from_account_id OR id = to_account_id) 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create privabank transactions from their account"
  ON public.privabank_transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.privabank_accounts 
      WHERE id = from_account_id 
      AND user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_privabank_accounts_updated_at
  BEFORE UPDATE ON public.privabank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_privabank_accounts_user_id ON public.privabank_accounts(user_id);
CREATE INDEX idx_privabank_transactions_from_account ON public.privabank_transactions(from_account_id);
CREATE INDEX idx_privabank_transactions_to_account ON public.privabank_transactions(to_account_id);
CREATE INDEX idx_privabank_transactions_created_at ON public.privabank_transactions(created_at DESC);