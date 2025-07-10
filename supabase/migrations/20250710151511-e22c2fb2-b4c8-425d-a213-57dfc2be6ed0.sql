-- Create privabank_logs table for tracking all PriveBank activities
CREATE TABLE public.privabank_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action_type VARCHAR(50) NOT NULL,
  action_details JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.privabank_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for privabank_logs
CREATE POLICY "Admins can manage all privabank logs" 
ON public.privabank_logs 
FOR ALL 
USING (is_admin());

-- Create index for performance
CREATE INDEX idx_privabank_logs_created_at ON public.privabank_logs (created_at DESC);
CREATE INDEX idx_privabank_logs_user_id ON public.privabank_logs (user_id);
CREATE INDEX idx_privabank_logs_action_type ON public.privabank_logs (action_type);