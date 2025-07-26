import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Settings } from 'lucide-react';

interface ChatBottomNavigationProps {
  activeTab: 'contacts' | 'conversations' | 'settings';
  onTabChange: (tab: 'contacts' | 'conversations' | 'settings') => void;
}

const ChatBottomNavigation: React.FC<ChatBottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    {
      id: 'contacts' as const,
      label: 'Contatos',
      icon: Users,
    },
    {
      id: 'conversations' as const,
      label: 'Conversas',
      icon: MessageSquare,
    },
    {
      id: 'settings' as const,
      label: 'Configurações',
      icon: Settings,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 px-2 py-2">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 p-2 h-auto min-w-[60px] transition-all duration-200 ${
                isActive
                  ? 'text-purple-400 bg-zinc-800/50'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-purple-400' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-purple-400' : ''}`}>
                {tab.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ChatBottomNavigation;