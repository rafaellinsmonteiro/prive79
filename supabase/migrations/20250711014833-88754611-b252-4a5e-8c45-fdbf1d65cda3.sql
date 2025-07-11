-- Adicionar saldo em reais para cada conta PriveBank
ALTER TABLE public.privabank_accounts 
ADD COLUMN balance_brl numeric DEFAULT 0 NOT NULL;

-- Adicionar campo de moeda nas transações
ALTER TABLE public.privabank_transactions 
ADD COLUMN currency varchar(10) DEFAULT 'PCoins' NOT NULL;

-- Atualizar comentários nas colunas
COMMENT ON COLUMN public.privabank_accounts.balance IS 'Saldo em P-Coins (P$)';
COMMENT ON COLUMN public.privabank_accounts.balance_brl IS 'Saldo em Reais (R$)';
COMMENT ON COLUMN public.privabank_transactions.currency IS 'Moeda da transação: PCoins ou BRL';