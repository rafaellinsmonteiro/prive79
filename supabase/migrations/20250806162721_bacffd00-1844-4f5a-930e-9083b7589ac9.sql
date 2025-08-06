-- Drop the existing policy first
DROP POLICY IF EXISTS "Allow public appointment creation for online bookings" ON public.appointments;

-- Create a more permissive policy for public bookings that works for unauthenticated users
CREATE POLICY "Enable public booking creation" 
ON public.appointments 
FOR INSERT 
WITH CHECK (
  booking_source = 'public' 
  AND auth.uid() IS NULL
);