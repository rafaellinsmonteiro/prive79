-- Create policy to allow public appointment creation for online bookings
CREATE POLICY "Allow public appointment creation for online bookings" 
ON public.appointments 
FOR INSERT 
WITH CHECK (booking_source = 'public');