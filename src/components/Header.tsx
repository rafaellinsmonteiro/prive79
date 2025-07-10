import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, 
  LogIn, 
  User, 
  MessageCircle, 
  Home, 
  CalendarDays, 
  Settings, 
  Users, 
  Star, 
  LogOut,
  DollarSign,
  ThumbsUp,
  UserCircle,
  Search,
  Heart,
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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

  // Menu items based on user type
  const getMenuItems = () => {
    if (!currentUser) return [];
    
    if (currentUser.user_role === 'modelo') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/model-dashboard' },
        { label: 'Agenda', icon: CalendarDays, path: '/agenda' },
        { label: 'Serviços', icon: Star, path: '/servicos' },
        { label: 'Clientes', icon: Users, path: '/clientes' },
        { label: 'PriveBank', icon: DollarSign, path: '/privebank' },
        { label: 'Avaliações', icon: ThumbsUp, path: '/avaliacoes' },
        { label: 'Perfil', icon: UserCircle, path: '/perfil' },
      ];
    } else {
      return [
        { label: 'Início', icon: Home, path: '/' },
        { label: 'Mensagens', icon: MessageCircle, path: '/chat' },
        { label: 'Buscar', icon: Search, path: '/buscar' },
        { label: 'Interesses', icon: Heart, path: '/interesses' },
        { label: 'PriveBank', icon: DollarSign, path: '/privebank' },
        { label: 'Avaliações', icon: ThumbsUp, path: '/avaliacoes' },
        { label: 'Perfil', icon: UserCircle, path: '/perfil' },
      ];
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
    return (
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img src={logo} alt="Logo" className="h-8 w-auto" />
            </div>
            
            {/* Login Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/login')}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Entrar
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-40">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-8 w-auto cursor-pointer" onClick={() => navigate('/')} />
          </div>
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                onClick={() => navigate(item.path)}
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
                <Button variant="ghost" className="relative h-10 w-auto px-3 rounded-full">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={currentUser?.name || 'User'} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getUserInitials(currentUser?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block font-medium text-sm">
                      {currentUser?.name || 'Usuário'}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={currentUser?.name || 'User'} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getUserInitials(currentUser?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser?.name || 'Usuário'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/perfil')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Editar Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  {menuItems.map((item) => (
                    <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
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