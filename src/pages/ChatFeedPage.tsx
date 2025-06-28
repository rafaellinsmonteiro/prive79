
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConversations } from '@/hooks/useChat';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ChatFeedPage = () => {
  const navigate = useNavigate();
  const { data: conversations = [] } = useConversations();

  // Mock data for recent updates - in a real app, this would come from an API
  const recentUpdates = [
    {
      id: '1',
      name: 'Evelyn',
      photo: '/placeholder.svg',
      lastUpdate: new Date(Date.now() - 40 * 60 * 1000), // 40 min ago
      hasUnread: true,
    },
    {
      id: '2', 
      name: 'Renata C12',
      photo: '/placeholder.svg',
      lastUpdate: new Date(Date.now() - 60 * 60 * 1000), // 1h ago
      hasUnread: false,
    },
    {
      id: '3',
      name: 'Mika Prima',
      photo: '/placeholder.svg', 
      lastUpdate: new Date(Date.now() - 60 * 60 * 1000), // 1h ago
      hasUnread: false,
    },
    {
      id: '4',
      name: 'Evelin Chacara',
      photo: '/placeholder.svg',
      lastUpdate: new Date(Date.now() - 13 * 60 * 1000), // 13 min ago
      hasUnread: true,
    },
    {
      id: '5',
      name: 'Lorena Samara',
      photo: '/placeholder.svg',
      lastUpdate: new Date(Date.now() - 60 * 60 * 1000), // 1h ago
      hasUnread: false,
    },
    {
      id: '6',
      name: 'Ëla_msm',
      photo: '/placeholder.svg',
      lastUpdate: new Date(Date.now() - 60 * 60 * 1000), // 1h ago
      hasUnread: false,
    },
  ];

  const formatLastUpdate = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat')}
            className="text-white hover:bg-zinc-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-white">Atualizações</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 mobile-content">
        <div className="space-y-6">
          {/* My Status Section */}
          <div>
            <h2 className="text-sm font-medium text-zinc-400 mb-3">Meu status</h2>
            <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg">
              <div className="relative">
                <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center border-2 border-dashed border-zinc-600">
                  <Plus className="h-5 w-5 text-zinc-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Meu status</p>
                <p className="text-sm text-zinc-400">Toque para adicionar uma atualização</p>
              </div>
            </div>
          </div>

          {/* Recent Updates Section */}
          <div>
            <h2 className="text-sm font-medium text-zinc-400 mb-3">Atualizações recentes</h2>
            <div className="space-y-3">
              {recentUpdates.map((update) => (
                <div
                  key={update.id}
                  className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full p-0.5 ${
                      update.hasUnread 
                        ? 'bg-gradient-to-r from-green-400 to-green-600' 
                        : 'bg-zinc-600'
                    }`}>
                      <img
                        src={update.photo}
                        alt={update.name}
                        className="w-full h-full rounded-full object-cover bg-zinc-700"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{update.name}</p>
                    <p className="text-sm text-zinc-400">
                      {formatLastUpdate(update.lastUpdate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatFeedPage;
