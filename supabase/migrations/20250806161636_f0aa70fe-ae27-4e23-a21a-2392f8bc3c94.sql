-- Create policy to allow public read access to active services
CREATE POLICY "Public can view active services" 
ON public.services 
FOR SELECT 
USING (is_active = true);