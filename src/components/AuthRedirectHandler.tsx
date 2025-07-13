import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export const AuthRedirectHandler = () => {
  useAuthRedirect();
  return null;
};