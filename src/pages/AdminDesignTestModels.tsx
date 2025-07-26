import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Search, Settings, Menu, Sun, Moon, User } from 'lucide-react';
import ModelsListContainer from '@/components/admin/ModelsListContainer';

const AdminDesignTestModels = () => {
  const isMobile = useIsMobile();
  const { data: user } = useCurrentUser();
  const [sidebarExpanded, setSidebarExpanded] = useState(!isMobile);
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setSidebarExpanded(!isMobile);
  }, [isMobile]);

  const navigationItems = [
    { name: 'Dashboard', href: '/admin-design-test', icon: '📊', active: false },
    { name: 'Modelos', href: '/admin-design-test/models', icon: '👥', active: true },
    { name: 'Usuários', href: '/admin-design-test/users', icon: '👤', active: false },
    { name: 'Campos', href: '/admin-design-test/fields', icon: '📝', active: false },
    { name: 'Chat', href: '/admin-design-test/chat', icon: '💬', active: false },
    { name: 'Agendamentos', href: '/admin-design-test/appointments', icon: '📅', active: false },
    { name: 'Configurações', href: '/admin-design-test/settings', icon: '⚙️', active: false },
  ];

  const accountItems = [
    { name: 'Perfil', icon: '👤' },
    { name: 'Configurações', icon: '⚙️' },
    { name: 'Suporte', icon: '❓' },
    { name: 'Sair', icon: '🚪' },
  ];

  const stats = [
    { title: 'Total de Modelos', value: '142', change: '+5%', positive: true },
    { title: 'Modelos Ativos', value: '89', change: '+12%', positive: true },
    { title: 'Novos Este Mês', value: '8', change: '+60%', positive: true },
    { title: 'Em Verificação', value: '12', change: '-15%', positive: false },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex bg-background text-foreground">
        {/* Sidebar */}
        <aside className={`bg-card border-r border-border transition-all duration-300 ${
          sidebarExpanded ? 'w-64' : 'w-16'
        } ${isMobile && !mobileMenuOpen ? 'hidden' : 'flex'} flex-col`}>
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">A</span>
              </div>
              {sidebarExpanded && <span className="font-semibold text-lg">Admin</span>}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navigationItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    item.active 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {sidebarExpanded && <span>{item.name}</span>}
                </a>
              ))}
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              {sidebarExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@example.com'}</p>
                </div>
              )}
            </div>
            
            {sidebarExpanded && (
              <div className="mt-3 space-y-1">
                {accountItems.map((item, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center space-x-2 px-2 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded"
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="w-full justify-start"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {sidebarExpanded && <span className="ml-2">Tema</span>}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => isMobile ? setMobileMenuOpen(!mobileMenuOpen) : setSidebarExpanded(!sidebarExpanded)}
                >
                  <Menu className="w-4 h-4" />
                </Button>
                <h1 className="text-xl font-semibold">Gestão de Modelos</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar..."
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-card rounded-lg border border-border p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`text-sm font-medium ${
                        stat.positive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Models Manager Component */}
              <ModelsListContainer />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDesignTestModels;