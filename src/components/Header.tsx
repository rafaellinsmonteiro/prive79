import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogIn, User, MessageCircle, Home, CalendarDays, Settings, Users, Star, LogOut, DollarSign, ThumbsUp, UserCircle, Search, Heart, LayoutDashboard, ChevronDown, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import defaultAvatar from "@/assets/default-avatar.png";
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

  // Menu items based on user type
  const getMenuItems = () => {
    if (!currentUser) return [];
    if (currentUser.user_role === 'modelo') {
      return [{
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/model-dashboard'
      }, {
        label: 'Mensagens',
        icon: MessageCircle,
        path: '/chat'
      }, {
        label: 'Agenda',
        icon: CalendarDays,
        path: '/agenda'
      }, {
        label: 'Serviços',
        icon: Star,
        path: '/servicos'
      }, {
        label: 'Clientes',
        icon: Users,
        path: '/clientes'
      }, {
        label: 'PriveBank',
        icon: DollarSign,
        path: '/privebank'
      }, {
        label: 'Avaliações',
        icon: ThumbsUp,
        path: '/avaliacoes'
      }, {
        label: 'Metas',
        icon: Target,
        path: '/model-dashboard?section=goals'
      }, {
        label: 'Perfil',
        icon: UserCircle,
        path: '/perfil'
      }];
    } else {
      return [{
        label: 'Início',
        icon: Home,
        path: '/'
      }, {
        label: 'Mensagens',
        icon: MessageCircle,
        path: '/chat'
      }, {
        label: 'Buscar',
        icon: Search,
        path: '/buscar'
      }, {
        label: 'Interesses',
        icon: Heart,
        path: '/interesses'
      }, {
        label: 'PriveBank',
        icon: DollarSign,
        path: '/privebank'
      }, {
        label: 'Avaliações',
        icon: ThumbsUp,
        path: '/avaliacoes'
      }, {
        label: 'Perfil',
        icon: UserCircle,
        path: '/perfil'
      }];
    }
  };
  const menuItems = getMenuItems();
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };
  if (!user || !authComplete) {
    return null;
  }

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={currentUser?.profile_photo_url || defaultAvatar} 
                      alt={currentUser?.name || 'User'} 
                    />
                    <AvatarFallback>
                      {getUserInitials(currentUser?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{currentUser?.name || 'Usuário'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/perfil')}>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-4 mt-8">
                  {menuItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      onClick={() => navigate(item.path)}
                      className="justify-start gap-3"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;