-- Clean up all public booking policies and create a comprehensive one
DROP POLICY IF EXISTS "Allow public bookings" ON public.appointments;
DROP POLICY IF EXISTS "Enable public booking creation" ON public.appointments;
DROP POLICY IF EXISTS "Allow public appointment creation for online bookings" ON public.appointments;

-- Create a comprehensive policy that allows public appointment creation
-- This policy will work regardless of authentication status for public bookings
CREATE POLICY "Public booking access" 
ON public.appointments 
FOR ALL
USING (booking_source = 'public')
WITH CHECK (booking_source = 'public');