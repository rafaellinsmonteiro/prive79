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

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <ChatLogin /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/" 
        element={user ? <ChatAppLayout /> : <Navigate to="/login" replace />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

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

export default ChatApp;