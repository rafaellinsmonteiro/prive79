
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CalendarDays, MessageSquare, Settings, Users, Star, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface BottomNavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

const modelNavigationItems: BottomNavigationItem[] = [
  {
    id: 'home',
    label: 'Início',
    icon: Home,
    path: '/',
  },
  {
    id: 'agenda',
    label: 'Agenda',
    icon: CalendarDays,
    path: '/agenda',
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageSquare,
    path: '/chat',
  },
  {
    id: 'services',
    label: 'Serviços',
    icon: Star,
    path: '/servicos',
  },
  {
    id: 'clients',
    label: 'Clientes',
    icon: Users,
    path: '/clientes',
  },
  {
    id: 'settings',
    label: 'Perfil',
    icon: Settings,
    path: '/model-dashboard',
  },
];

const clientNavigationItems: BottomNavigationItem[] = [
  {
    id: 'home',
    label: 'Início',
    icon: Home,
    path: '/',
  },
  {
    id: 'reels',
    label: 'Reels',
    icon: Play,
    path: '/reels',
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageSquare,
    path: '/chat',
  },
  {
    id: 'account',
    label: 'Minha Conta',
    icon: Settings,
    path: '/profile',
  },
];

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Determine which navigation items to show based on user role
  const navigationItems = currentUser?.user_role === 'modelo' 
    ? modelNavigationItems 
    : clientNavigationItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 md:hidden">
      <div className="flex items-center justify-around px-4 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 relative",
                "transition-colors duration-200",
                active 
                  ? "text-blue-500" 
                  : "text-zinc-400 hover:text-zinc-300"
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6 mb-1" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
