-- Permitir que a edge function atualize os PIX deposits
CREATE POLICY "Edge functions can update PIX deposits" 
ON pix_deposits 
FOR UPDATE 
USING (true);