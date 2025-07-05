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
  return <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40">
      
    </header>;
};
export default Header;