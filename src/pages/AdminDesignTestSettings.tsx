import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Search, Settings, Menu, Sun, Moon, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDesignTestSettings = () => {
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
    { name: 'Modelos', href: '/admin-design-test/models', icon: '👥', active: false },
    { name: 'Usuários', href: '/admin-design-test/users', icon: '👤', active: false },
    { name: 'Campos', href: '/admin-design-test/fields', icon: '📝', active: false },
    { name: 'Chat', href: '/admin-design-test/chat', icon: '💬', active: false },
    { name: 'Agendamentos', href: '/admin-design-test/appointments', icon: '📅', active: false },
    { name: 'Configurações', href: '/admin-design-test/settings', icon: '⚙️', active: true },
  ];

  const accountItems = [
    { name: 'Perfil', icon: '👤' },
    { name: 'Configurações', icon: '⚙️' },
    { name: 'Suporte', icon: '❓' },
    { name: 'Sair', icon: '🚪' },
  ];

  const settingsSections = [
    {
      title: 'Configurações Gerais',
      description: 'Configurações básicas do sistema',
      items: [
        { name: 'Nome do Sistema', value: 'Admin Panel', type: 'text' },
        { name: 'Email de Contato', value: 'admin@example.com', type: 'email' },
        { name: 'Fuso Horário', value: 'America/Sao_Paulo', type: 'select' },
        { name: 'Idioma Padrão', value: 'Português', type: 'select' },
      ]
    },
    {
      title: 'Notificações',
      description: 'Configure as notificações do sistema',
      items: [
        { name: 'Email de Notificações', value: true, type: 'toggle' },
        { name: 'SMS de Emergência', value: false, type: 'toggle' },
        { name: 'Push Notifications', value: true, type: 'toggle' },
        { name: 'Relatórios Semanais', value: true, type: 'toggle' },
      ]
    },
    {
      title: 'Segurança',
      description: 'Configurações de segurança e acesso',
      items: [
        { name: 'Autenticação 2FA', value: true, type: 'toggle' },
        { name: 'Sessão Automática (min)', value: '30', type: 'number' },
        { name: 'Tentativas de Login', value: '5', type: 'number' },
        { name: 'Backup Automático', value: true, type: 'toggle' },
      ]
    },
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
                <h1 className="text-xl font-semibold">Configurações</h1>
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
            <div className="max-w-4xl mx-auto space-y-6">
              {settingsSections.map((section, sectionIndex) => (
                <Card key={sectionIndex}>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">{section.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                        </div>
                        <div className="w-48">
                          {item.type === 'text' || item.type === 'email' || item.type === 'number' ? (
                            <Input 
                              type={item.type}
                              defaultValue={item.value as string}
                              className="w-full"
                            />
                          ) : item.type === 'select' ? (
                            <select className="w-full px-3 py-2 border border-border rounded-md bg-background">
                              <option value={item.value as string}>{item.value as string}</option>
                            </select>
                          ) : item.type === 'toggle' ? (
                            <div className="flex items-center">
                              <input 
                                type="checkbox" 
                                defaultChecked={item.value as boolean}
                                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {/* Save Button */}
              <div className="flex justify-end">
                <Button className="px-8">
                  Salvar Configurações
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDesignTestSettings;