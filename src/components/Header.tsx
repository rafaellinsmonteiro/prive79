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
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-8 w-8" />
          <h1 className="text-zinc-100 text-xl font-bold">App</h1>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6">
          {user && navigationMenuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
              onClick={() => navigate(item.path)}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Login/Logout Button */}
          {shouldShowLoginIcon ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800">
                  <User className="w-4 h-4 mr-2" />
                  {currentUser?.name || user?.email || 'Usuário'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
                <DropdownMenuItem
                  onClick={() => navigate('/profile')}
                  className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Hamburger Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700 w-48">
                {navigationMenuItems.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;