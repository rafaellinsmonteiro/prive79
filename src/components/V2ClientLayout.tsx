import React, { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Search, Rss, MessageCircle, CreditCard, 
  Star, User, Menu, X, Sun, Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import V2Header from '@/components/V2Header';
import { useIsMobile } from '@/hooks/use-mobile';

interface V2ClientLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  activeId?: string;
}

export function V2ClientLayout({ title, subtitle, children, activeId }: V2ClientLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  const principalItems = [
    { icon: Home, label: 'Dashboard', id: 'dashboard', link: '/v2/client/dashboard', badge: null },
    { icon: Search, label: 'Buscar', id: 'search', link: '/v2/client/search', badge: null },
    { icon: Rss, label: 'Feed', id: 'feed', link: '/v2/client/feed', badge: null },
    { icon: MessageCircle, label: 'Chat', id: 'chat', link: '/v2/client/chat', badge: null },
    { icon: CreditCard, label: 'PriveBank', id: 'privebank', link: '/v2/client/privebank', badge: null },
    { icon: Star, label: 'Avaliações', id: 'reviews', link: '/v2/client/reviews', badge: null },
    { icon: User, label: 'Minha Conta', id: 'account', link: '/v2/client/account', badge: null },
  ];

  const toggleSidebar = () => setSidebarExpanded(!sidebarExpanded);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const renderNavItem = (item: any) => {
    const isActive = location.pathname === item.link || activeId === item.id;
    const Icon = item.icon;
    
    return (
      <Link
        key={item.id}
        to={item.link}
        className="block w-full"
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={`w-full justify-start h-12 px-4 transition-all duration-200 ${
            isActive 
              ? 'bg-primary/10 text-primary border-r-2 border-primary' 
              : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon className={`h-5 w-5 ${sidebarExpanded ? 'mr-3' : ''}`} />
          {sidebarExpanded && (
            <span className="font-medium">{item.label}</span>
          )}
          {item.badge && sidebarExpanded && (
            <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </Button>
      </Link>
    );
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <V2Header 
          title={title} 
          subtitle={subtitle}
          onMobileMenuToggle={toggleMobileMenu}
        />
        
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden">
            <div className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-lg">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {user?.email?.charAt(0).toUpperCase() || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Cliente</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileMenu}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <nav className="p-4 space-y-2">
                {principalItems.map(renderNavItem)}
              </nav>
              
              <div className="absolute bottom-4 left-4 right-4">
                <Button
                  variant="outline"
                  onClick={toggleDarkMode}
                  className="w-full justify-start"
                >
                  {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <main className="pb-20">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`${sidebarExpanded ? 'w-64' : 'w-16'} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {sidebarExpanded && (
              <div className="flex items-center space-x-3">
                <img src="/placeholder.svg" alt="Logo" className="h-8 w-8" />
                <span className="text-lg font-bold text-foreground">Cliente</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {principalItems.map(renderNavItem)}
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          <Button
            variant="outline"
            onClick={toggleDarkMode}
            className={`${sidebarExpanded ? 'w-full justify-start' : 'w-10 h-10 p-0'}`}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {sidebarExpanded && <span className="ml-2">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>}
          </Button>
          
          <div className={`flex items-center ${sidebarExpanded ? 'space-x-3' : 'justify-center'}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            {sidebarExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Cliente</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <V2Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}