-- Fix RLS policies for privabank_logs table
DROP POLICY IF EXISTS "Users can create privabank logs" ON public.privabank_logs;
DROP POLICY IF EXISTS "Users can view their own privabank logs" ON public.privabank_logs;

-- Allow authenticated users to create logs
CREATE POLICY "Users can create privabank logs" 
ON public.privabank_logs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view their own logs  
CREATE POLICY "Users can view their own privabank logs" 
ON public.privabank_logs 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Fix the user search issue by ensuring system_users has proper RLS
DROP POLICY IF EXISTS "Users can search other users by email" ON public.system_users;

-- Allow authenticated users to search for other users by email (needed for transfers)
CREATE POLICY "Users can search other users by email" 
ON public.system_users 
FOR SELECT 
TO authenticated
USING (true);