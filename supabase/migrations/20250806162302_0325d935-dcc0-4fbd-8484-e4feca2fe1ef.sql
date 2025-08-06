-- Create policy to allow public client creation for bookings
CREATE POLICY "Allow public client creation for bookings" 
ON public.clients 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow public client read for bookings  
CREATE POLICY "Allow public client read for bookings" 
ON public.clients 
FOR SELECT 
USING (true);