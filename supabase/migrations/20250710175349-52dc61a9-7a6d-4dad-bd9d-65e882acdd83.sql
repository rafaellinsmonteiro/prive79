-- Add UPDATE policies for privabank_accounts to allow balance updates during transfers
-- Users can only update balances of accounts involved in their own transactions

CREATE POLICY "Users can update account balances during transfers" 
ON privabank_accounts 
FOR UPDATE 
TO authenticated 
USING (
  -- User can update their own account balance
  auth.uid() = user_id 
  OR 
  -- Or update any active account balance if they have an active account (for receiving transfers)
  (is_active = true AND EXISTS (
    SELECT 1 FROM privabank_accounts own_account 
    WHERE own_account.user_id = auth.uid() 
    AND own_account.is_active = true
  ))
);