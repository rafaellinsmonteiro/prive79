import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, MessageSquare, Calendar, TrendingUp, Settings, LogOut, Sun, Moon, ChevronLeft, Search, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import ModelsListContainer from '@/components/admin/ModelsListContainer';

const DesignTestModelsPage = () => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [isDark, setIsDark] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  const navigationItems = [{
    icon: LayoutDashboard,
    label: 'Dashboard',
    id: 'dashboard',
    active: false
  }, {
    icon: Users,
    label: 'Modelos',
    id: 'models',
    badge: '24',
    active: true
  }, {
    icon: MessageSquare,
    label: 'Conversas',
    id: 'chat',
    badge: '5'
  }, {
    icon: Calendar,
    label: 'Agenda',
    id: 'calendar'
  }, {
    icon: TrendingUp,
    label: 'Analytics',
    id: 'analytics'
  }];

  const accountItems = [{
    icon: Settings,
    label: 'Configurações',
    id: 'settings'
  }, {
    icon: LogOut,
    label: 'Sair',
    id: 'logout'
  }];

  // Apply theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={`min-h-screen bg-background text-foreground transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`
          ${isExpanded ? 'w-64' : 'w-16'} 
          ${isMobile ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          fixed left-0 top-0 h-full bg-card border-r border-border z-50 lg:relative lg:translate-x-0
          transition-all duration-300 ease-in-out
        `}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 lg:p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm lg:text-lg">P</span>
                </div>
                {isExpanded && (
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg lg:text-xl font-bold text-foreground truncate">Prive</h1>
                    <p className="text-xs lg:text-sm text-muted-foreground truncate">Admin Panel</p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2">
              {navigationItems.map((item, index) => (
                <button
                  key={index}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 lg:py-3 rounded-xl transition-all duration-200 group relative
                    ${item.active 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-x-1' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <item.icon className={`w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200 ${hoveredItem === item.id ? 'scale-110' : ''}`} />
                  {isExpanded && (
                    <>
                      <span className="text-sm lg:text-base font-medium flex-1 text-left truncate">{item.label}</span>
                      {item.badge && (
                        <Badge variant={item.active ? "secondary" : "outline"} className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                  {!isExpanded && item.badge && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </button>
              ))}
            </nav>

            {/* Account Section */}
            <div className="p-3 lg:p-4 border-t border-border space-y-1 lg:space-y-2">
              {accountItems.map((item, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 px-3 py-2.5 lg:py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 group"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <item.icon className={`w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200 ${hoveredItem === item.id ? 'scale-110' : ''}`} />
                  {isExpanded && (
                    <span className="text-sm lg:text-base font-medium flex-1 text-left truncate">{item.label}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-card border-b border-border p-4 lg:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 lg:gap-4">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                
                {/* Desktop Sidebar Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`} />
                </Button>

                <div className="hidden sm:flex">
                  <h2 className="text-xl lg:text-2xl font-bold text-foreground">Gestão de Modelos</h2>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:gap-4">
                {/* Search */}
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    className="pl-9 pr-4 w-64 lg:w-80 bg-background border-border"
                  />
                </div>

                {/* Theme Toggle */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-accent">
                  <Sun className="w-4 h-4 text-muted-foreground" />
                  <Switch
                    checked={isDark}
                    onCheckedChange={setIsDark}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Moon className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
                </Button>

                {/* User Avatar */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-primary/20">
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-xs lg:text-sm">
                      JW
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xs lg:text-sm hidden sm:block">
                    <div className="font-semibold text-foreground">John Wilson</div>
                    <div className="text-muted-foreground">Admin</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="p-4 lg:p-8 overflow-y-auto flex-1">
            <ModelsListContainer />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DesignTestModelsPage;