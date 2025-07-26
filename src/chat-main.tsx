console.log('🚀 CHAT-APP: Loading chat-main.tsx - This should ONLY appear in chat.prive.click');

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from '@/contexts/AuthContext';
import ChatApp from './ChatApp.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ChatApp />
    </AuthProvider>
  </StrictMode>,
);