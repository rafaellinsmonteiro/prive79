-- First check what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'appointments';

-- Drop the existing policy and create a simpler one
DROP POLICY IF EXISTS "Enable public booking creation" ON public.appointments;

-- Create a simpler policy that allows any insert with booking_source = 'public'
-- This bypasses authentication requirements for public bookings
CREATE POLICY "Allow public bookings" 
ON public.appointments 
FOR INSERT 
WITH CHECK (booking_source = 'public');