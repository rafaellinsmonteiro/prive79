import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Image, 
  User, 
  Calendar,
  Star,
  Users,
  CreditCard,
  Sun,
  Moon
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DarkSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const DarkSidebar: React.FC<DarkSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/v2/model/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: 'Chat',
      path: '/v2/chat',
      icon: MessageSquare,
      badge: 5,
    },
    {
      title: 'Mídias',
      path: '/v2/model/media',
      icon: Image,
      badge: null,
    },
    {
      title: 'Perfil',
      path: '/v2/model/profile',
      icon: User,
      badge: null,
    },
    {
      title: 'Agenda',
      path: '/v2/model/appointments',
      icon: Calendar,
      badge: null,
    },
    {
      title: 'Serviços',
      path: '/v2/model/services',
      icon: Star,
      badge: null,
    },
    {
      title: 'Clientes',
      path: '/v2/model/clients',
      icon: Users,
      badge: null,
    },
    {
      title: 'PriveBank',
      path: '/v2/bank',
      icon: CreditCard,
      badge: null,
    },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-zinc-900 border-r border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Menu Section */}
          <div className="flex-1 p-4">
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                PRINCIPAL
              </h2>
              
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = isActiveRoute(item.path);
                  const Icon = item.icon;
                  
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-yellow-400/10 text-yellow-400"
                          : "text-zinc-300 hover:text-white hover:bg-zinc-800"
                      )}
                      onClick={() => onClose?.()}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                      
                      {item.badge && (
                        <Badge className="bg-yellow-400 text-zinc-900 text-xs px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                          {item.badge}
                        </Badge>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Section - Theme Toggle */}
          <div className="p-4 border-t border-zinc-800">
            <div className="bg-zinc-800 rounded-xl p-3 flex items-center justify-center gap-3">
              <Sun className="h-4 w-4 text-zinc-400" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="bg-yellow-400 hover:bg-yellow-500 w-12 h-6 rounded-full p-0 relative"
              >
                <div 
                  className={cn(
                    "w-5 h-5 bg-zinc-900 rounded-full transition-transform duration-200",
                    isDarkMode ? "translate-x-3" : "-translate-x-3"
                  )}
                />
              </Button>
              <Moon className="h-4 w-4 text-zinc-400" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DarkSidebar;