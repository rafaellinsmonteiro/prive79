
-- Add admin policies for model_profiles table
CREATE POLICY "Admins can create model profiles for any user" 
  ON public.model_profiles 
  FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can view all model profiles" 
  ON public.model_profiles 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Admins can update all model profiles" 
  ON public.model_profiles 
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete all model profiles" 
  ON public.model_profiles 
  FOR DELETE 
  USING (public.is_admin());

-- Add admin policies for chat_users table
CREATE POLICY "Admins can create chat users for any user" 
  ON public.chat_users 
  FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can view all chat users" 
  ON public.chat_users 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Admins can update all chat users" 
  ON public.chat_users 
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete all chat users" 
  ON public.chat_users 
  FOR DELETE 
  USING (public.is_admin());
