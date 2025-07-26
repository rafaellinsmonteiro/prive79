import React from 'react';
import ChatManager from '@/components/admin/ChatManager';

const AdminChatPage = () => {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto p-6">
        <ChatManager />
      </div>
    </div>
  );
};

export default AdminChatPage;