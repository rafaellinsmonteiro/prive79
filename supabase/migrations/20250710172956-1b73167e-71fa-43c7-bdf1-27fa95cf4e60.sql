-- Fix RLS policies for privabank_accounts to allow transfers by account ID
-- Users need to be able to find destination accounts for transfers

-- Drop existing policies for privabank_accounts
DROP POLICY IF EXISTS "Admins can manage all privabank accounts" ON privabank_accounts;
DROP POLICY IF EXISTS "Users can view their own privabank account" ON privabank_accounts;

-- Create new policies for privabank_accounts
CREATE POLICY "Admins can manage all privabank accounts" 
ON privabank_accounts 
FOR ALL 
TO authenticated 
USING (is_admin());

CREATE POLICY "Users can view their own privabank account" 
ON privabank_accounts 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can find accounts for transfers" 
ON privabank_accounts 
FOR SELECT 
TO authenticated 
USING (is_active = true);

-- Update transaction policies to allow transfers between active accounts
DROP POLICY IF EXISTS "Users can create privabank transactions from their account" ON privabank_transactions;

CREATE POLICY "Users can create privabank transactions from their account" 
ON privabank_transactions 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM privabank_accounts 
    WHERE id = from_account_id 
    AND user_id = auth.uid() 
    AND is_active = true
  )
);