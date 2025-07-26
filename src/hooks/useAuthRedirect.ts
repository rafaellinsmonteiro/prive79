import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAuthRedirect = () => {
  const { user, authComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || !authComplete) return;
    
    // Se estiver no chat-app (chat.prive.click), não fazer redirecionamentos automáticos
    if (window.location.hostname === 'chat.prive.click' || localStorage.getItem('chat-app-login')) {
      return;
    }
    
    // Não redirecionar se já estiver em uma rota V2, admin, login ou páginas específicas
    if (
      location.pathname.startsWith('/v2/') || 
      location.pathname.startsWith('/admin') ||
      location.pathname === '/login' ||
      location.pathname === '/privebank' ||
      location.pathname.startsWith('/agendar-')
    ) {
      return;
    }

    const checkUserTypeAndRedirect = async () => {
      try {
        // Verificar se é modelo
        const { data: modelProfile } = await supabase
          .from('model_profiles')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (modelProfile) {
          console.log('AuthRedirect: Redirecting modelo to dashboard');
          navigate('/v2/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error checking user type for redirect:', error);
      }
    };

    checkUserTypeAndRedirect();
  }, [user, authComplete, navigate, location.pathname]);
};