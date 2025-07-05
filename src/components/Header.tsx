import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, LogIn, User, MessageCircle, Home, CalendarDays, Settings, Users, Star, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
const Header = () => {
  const {
    user,
    authComplete,
    loading,
    signOut
  } = useAuth();
  const {
    data: currentUser
  } = useCurrentUser();
  const navigate = useNavigate();

  // Determine if login icon should be shown
  const shouldShowLoginIcon = !user || !authComplete && !loading;

  // Menu items for hamburger menu
  const navigationMenuItems = [{
    label: 'Início',
    icon: Home,
    path: '/'
  }, {
    label: 'Agenda',
    icon: CalendarDays,
    path: '/agenda'
  }, {
    label: 'Chat',
    icon: MessageCircle,
    path: '/chat'
  }, {
    label: 'Chat Inteligente',
    icon: Sparkles,
    path: '/chat-inteligente'
  }, {
    label: 'Serviços',
    icon: Star,
    path: '/servicos'
  }, {
    label: 'Clientes',
    icon: Users,
    path: '/clientes'
  }, {
    label: 'Perfil',
    icon: Settings,
    path: '/model-dashboard'
  }];
  return (
    <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationMenuItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="text-zinc-300 hover:text-white flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {shouldShowLoginIcon ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-zinc-300"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-zinc-300">
                    <User className="h-4 w-4 mr-2" />
                    {currentUser?.name || user?.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {navigationMenuItems.map((item) => (
                    <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;