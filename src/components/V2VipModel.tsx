import React, { useState, useEffect, ReactNode } from 'react';
import { LayoutDashboard, MessageSquare, Image, User, Calendar, Star, Users, Sun, Moon, ChevronLeft, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import V2Header from '@/components/V2Header';

interface V2VipModelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  activeId?: string;
}

const V2VipModel = ({ title, subtitle, children, activeId }: V2VipModelProps) => {
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

  const principalItems = [{
    icon: LayoutDashboard,
    label: 'Dashboard',
    id: 'dashboard',
    link: '/v2/dashboard'
  }, {
    icon: MessageSquare,
    label: 'Chat',
    id: 'chat',
    link: '/v2/chat',
    badge: '5'
  }, {
    icon: Image,
    label: 'Mídias',
    id: 'media',
    link: '/v2/media'
  }, {
    icon: User,
    label: 'Perfil',
    id: 'profile',
    link: '/v2/profile'
  }, {
    icon: Calendar,
    label: 'Agenda',
    id: 'appointments',
    link: '/v2/appointments'
  }, {
    icon: Star,
    label: 'Serviços',
    id: 'services',
    link: '/v2/services'
  }, {
    icon: Users,
    label: 'Clientes',
    id: 'clients',
    link: '/v2/clients'
  }, {
    icon: Wallet,
    label: 'PriveBank',
    id: 'bank',
    link: '/v2/bank'
  }];

  const renderNavItem = (item: any) => (
    <div key={item.id} className="relative group" onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}>
      {item.link ? (
        <Link to={item.link}>
          <Button variant="ghost" className={`
              w-full justify-start px-3 py-3 h-12 rounded-xl transition-all duration-200
              ${activeId === item.id ? 'bg-gradient-to-r from-primary/20 to-primary/30 text-primary shadow-lg border border-primary/20' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}
            `}>
            <item.icon className="w-5 h-5 shrink-0" />
            {(isExpanded || isMobileMenuOpen) && (
              <>
                <span className="ml-3 font-medium">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-sm">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </Link>
      ) : (
        <Button variant="ghost" className="w-full justify-start px-3 py-3 h-12 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200">
          <item.icon className="w-5 h-5 shrink-0" />
          {(isExpanded || isMobileMenuOpen) && <span className="ml-3 font-medium">{item.label}</span>}
        </Button>
      )}
      
      {/* Tooltip para estado colapsado - apenas desktop */}
      {!isMobile && !isExpanded && hoveredItem === item.id && (
        <div className="absolute left-20 top-3 z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg whitespace-nowrap">
          {item.label}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen flex w-full ${isDark ? 'dark' : ''} bg-background text-foreground`}>
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
          bg-card 
          border-r border-border 
          transition-all duration-300 ease-in-out
          flex flex-col
          shadow-xl
          ${isMobile ? 
            `fixed left-0 top-0 h-full z-50 ${isMobileMenuOpen ? 'w-72' : 'w-0 overflow-hidden'}` : 
            `relative ${isExpanded ? 'w-72' : 'w-20'}`
          }
        `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-[0_4px_20px_hsl(var(--primary))_/_0.3]">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              {isExpanded && (
                <div>
                  <div className="font-bold text-lg text-foreground">PrivePlatform</div>
                  <div className="text-sm text-muted-foreground">
                    Premium Experience
                  </div>
                </div>
              )}
            </div>
            {!isMobile && (
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-muted-foreground hover:text-foreground hover:bg-accent p-2 rounded-lg">
                <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {/* Principal Navigation */}
          <div>
            {(isExpanded || isMobileMenuOpen) && (
              <div className="text-xs font-semibold mb-4 px-3 text-muted-foreground uppercase tracking-wider">
                Principal
              </div>
            )}
            <nav className="space-y-2">
              {principalItems.map(renderNavItem)}
            </nav>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-center gap-3 bg-accent rounded-xl p-3">
            <Sun className={`w-4 h-4 ${isDark ? 'text-muted-foreground' : 'text-primary'}`} />
            <Switch checked={isDark} onCheckedChange={setIsDark} className="data-[state=checked]:bg-primary" />
            <Moon className={`w-4 h-4 ${isDark ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 bg-background overflow-hidden ${isMobile ? 'w-full' : ''}`}>
        <V2Header 
          title={title} 
          subtitle={subtitle}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Content Area */}
        <main className="p-4 lg:p-8 overflow-y-auto h-[calc(100vh-120px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default V2VipModel;