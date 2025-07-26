import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import ChatLogin from '@/pages/ChatLogin';
import ChatAppLayout from '@/components/chat/ChatAppLayout';

const queryClient = new QueryClient();

function ChatAppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    );
  }

  // Para o chat-app standalone, sempre mostrar a interface de chat se logado
  if (user) {
    // Marca que o login foi feito pelo chat-app
    if (!localStorage.getItem('chat-app-login')) {
      localStorage.setItem('chat-app-login', 'true');
    }
    return (
      <Routes>
        <Route path="*" element={<ChatAppLayout />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={<ChatLogin />} 
      />
      <Route 
        path="/" 
        element={<Navigate to="/login" replace />} 
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// Standalone version with Router (for index-chat.html)
function ChatApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <ChatAppRoutes />
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

// Nested version without Router (for use inside main app)
export function ChatAppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <ChatLogin />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <ChatAppLayout />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default ChatApp;