import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Calendar, 
  Star, 
  Image, 
  Video, 
  MessageCircle, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Dashboard', url: '/design-test/dashboard', icon: LayoutDashboard },
  { title: 'Modelos', url: '/design-test/models', icon: Users },
  { title: 'Clientes', url: '/design-test/clients', icon: UserCheck },
  { title: 'Agenda', url: '/design-test/appointments', icon: Calendar },
  { title: 'Avaliações', url: '/design-test/reviews', icon: Star },
  { title: 'Galeria', url: '/design-test/gallery', icon: Image },
  { title: 'Reels', url: '/design-test/reels', icon: Video },
  { title: 'Chat', url: '/design-test/chat', icon: MessageCircle },
  { title: 'Configurações', url: '/design-test/settings', icon: Settings },
];

interface DesignTestLayoutProps {
  children: React.ReactNode;
  title: string;
}

function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar className={cn(
      "transition-all duration-300 border-r border-[hsl(var(--gold-accent))]/20",
      !open ? "w-16" : "w-64"
    )}>
      <SidebarContent className="bg-[hsl(var(--dark-card))] border-r border-[hsl(var(--gold-accent))]/20">
        {/* Logo */}
        <div className="p-6 border-b border-[hsl(var(--gold-accent))]/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))] flex items-center justify-center">
              <span className="text-[hsl(var(--dark-primary))] font-bold text-sm">P</span>
            </div>
            {open && (
              <div>
                <h1 className="text-[hsl(var(--gold-primary))] font-bold text-lg">Privé</h1>
                <p className="text-[hsl(var(--dark-muted))] text-xs">Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[hsl(var(--gold-accent))]/80 text-xs uppercase tracking-wider px-6 py-3">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                          "hover:bg-[hsl(var(--gold-accent))]/10 hover:text-[hsl(var(--gold-primary))]",
                          isActive
                            ? "bg-gradient-to-r from-[hsl(var(--gold-primary))]/20 to-[hsl(var(--gold-accent))]/20 text-[hsl(var(--gold-primary))] border-l-2 border-[hsl(var(--gold-primary))]"
                            : "text-[hsl(var(--dark-muted))]"
                        )}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 transition-colors",
                          isActive ? "text-[hsl(var(--gold-primary))]" : "text-[hsl(var(--dark-muted))]"
                        )} />
                        {open && (
                          <span className="font-medium">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function DesignTestLayout({ children, title }: DesignTestLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[hsl(var(--dark-primary))] text-[hsl(var(--dark-text))]">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--dark-card))] border-b border-[hsl(var(--gold-accent))]/20 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))] flex items-center justify-center">
                <span className="text-[hsl(var(--dark-primary))] font-bold text-sm">P</span>
              </div>
              <h1 className="text-[hsl(var(--gold-primary))] font-bold text-lg">Privé</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))]"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-[hsl(var(--dark-primary))]/95 backdrop-blur-sm">
            <div className="fixed top-16 left-0 right-0 bottom-0 bg-[hsl(var(--dark-card))] border-t border-[hsl(var(--gold-accent))]/20 p-4">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      "hover:bg-[hsl(var(--gold-accent))]/10 hover:text-[hsl(var(--gold-primary))]",
                      isActive
                        ? "bg-gradient-to-r from-[hsl(var(--gold-primary))]/20 to-[hsl(var(--gold-accent))]/20 text-[hsl(var(--gold-primary))]"
                        : "text-[hsl(var(--dark-muted))]"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <main className="pt-16 min-h-screen">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-[hsl(var(--gold-primary))] mb-6">{title}</h1>
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-[hsl(var(--dark-primary))] text-[hsl(var(--dark-text))] flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Desktop Header */}
          <header className="h-16 border-b border-[hsl(var(--gold-accent))]/20 bg-[hsl(var(--dark-card))] flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))]" />
              <h1 className="text-2xl font-bold text-[hsl(var(--gold-primary))]">{title}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))]"></div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}