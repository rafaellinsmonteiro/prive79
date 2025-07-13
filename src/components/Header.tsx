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
    return;
  }
  return;
};
export default Header;