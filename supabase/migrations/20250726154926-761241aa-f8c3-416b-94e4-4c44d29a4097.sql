-- Zerar o saldo em reais da conta da Cigana (0dd45ac8-6eab-45a4-bede-503bba8f7f3e)
UPDATE privabank_accounts 
SET balance_brl = 0, updated_at = now()
WHERE user_id = '0dd45ac8-6eab-45a4-bede-503bba8f7f3e';