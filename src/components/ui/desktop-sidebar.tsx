
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'feed',
    label: 'Feed',
    icon: Home,
    path: '/chat-feed',
  },
  {
    id: 'conversations',
    label: 'Conversas',
    icon: MessageCircle,
    path: '/chat',
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    path: '/profile',
  },
];

const DesktopSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Only show on desktop
  if (isMobile) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 z-40 h-full w-20 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-6">
      <div className="flex flex-col space-y-6">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-12 h-12 rounded-lg relative",
                "transition-colors duration-200",
                active 
                  ? "bg-blue-600 text-white" 
                  : "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
              )}
              title={item.label}
            >
              <Icon className="h-6 w-6" />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DesktopSidebar;
