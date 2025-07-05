import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, LogIn, User, MessageCircle, Home, CalendarDays, Settings, Users, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
const Header = () => {
  const {
    user,
    authComplete,
    loading
  } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate();

  // Determine if login icon should be shown
  const shouldShowLoginIcon = !user || !authComplete && !loading;

  // Menu items for hamburger menu
  const navigationMenuItems = [
    { label: 'Início', icon: Home, path: '/' },
    { label: 'Agenda', icon: CalendarDays, path: '/agenda' },
    { label: 'Chat', icon: MessageCircle, path: '/chat' },
    { label: 'Serviços', icon: Star, path: '/servicos' },
    { label: 'Clientes', icon: Users, path: '/clientes' },
    { label: 'Perfil', icon: Settings, path: '/model-dashboard' },
  ];
  
  return (
    <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5 text-zinc-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {navigationMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => navigate(item.path)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <img 
            src={logo} 
            alt="VITRINE" 
            className="h-8 w-auto"
          />
        </div>

        {/* User Info */}
        {user && currentUser && (
          <div className="flex items-center gap-2 text-zinc-100">
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">
              {currentUser.name || currentUser.email}
            </span>
          </div>
        )}

        {/* Login button if not authenticated */}
        {shouldShowLoginIcon && (
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            <LogIn className="h-4 w-4 mr-2" />
            Entrar
          </Button>
        )}
      </div>
    </header>
  );
};
export default Header;