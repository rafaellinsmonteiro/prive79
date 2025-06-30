
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import UserProfile from '@/components/UserProfile';

const Profile = () => {
  const { user, loading, authComplete } = useAuth();
  const navigate = useNavigate();

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (authComplete && !user) {
      navigate('/login');
    }
  }, [authComplete, user, navigate]);

  // Mostrar loading enquanto verifica autenticação
  if (loading || !authComplete) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  // Se não há usuário e auth já completou, não renderizar nada (redirecionamento acontecerá)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <UserProfile />
        </div>
      </div>
    </div>
  );
};

export default Profile;
