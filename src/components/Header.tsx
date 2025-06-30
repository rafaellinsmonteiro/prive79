import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu";
import { Menu, MapPin, ChevronDown, LogIn, User, MessageCircle } from "lucide-react";
import { useCities } from "@/hooks/useCities";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useAuth } from "@/hooks/useAuth";
import { useCity } from "@/contexts/CityContext";
import { useNavigate } from "react-router-dom";
const Header = () => {
  const {
    data: cities = []
  } = useCities();
  const {
    user,
    authComplete,
    loading
  } = useAuth();
  const {
    selectedCityId,
    selectedCityName,
    setSelectedCity
  } = useCity();
  const navigate = useNavigate();

  // Debug logs
  console.log('Header render - user:', !!user, 'authComplete:', authComplete, 'loading:', loading);
  console.log('Header render - selectedCityId:', selectedCityId, 'selectedCityName:', selectedCityName);
  const {
    data: menuItems = []
  } = useMenuItems(selectedCityId, !!user);
  console.log('Header - menuItems received:', menuItems);
  console.log('Header - menuItems structure check:', menuItems.map(item => ({
    id: item.id,
    title: item.title,
    parent_id: item.parent_id,
    hasChildren: !!(item.children && item.children.length > 0),
    childrenCount: item.children?.length || 0
  })));

  // Separar itens por tipo - apenas itens raiz (sem parent_id) e sem filhos
  const rootUrlItems = menuItems.filter(item => item.menu_type === 'url' && !item.parent_id && (!item.children || item.children.length === 0));
  const rootCategoryItems = menuItems.filter(item => item.menu_type === 'category' && !item.parent_id && (!item.children || item.children.length === 0));
  const parentItemsWithChildren = menuItems.filter(item => !item.parent_id && item.children && item.children.length > 0);
  console.log('Header - rootUrlItems:', rootUrlItems.map(i => i.title));
  console.log('Header - rootCategoryItems:', rootCategoryItems.map(i => i.title));
  console.log('Header - parentItemsWithChildren:', parentItemsWithChildren.map(i => i.title));
  const handleMenuClick = (item: any) => {
    if (item.menu_type === 'url' && item.url) {
      // Navegar para URL
      if (item.url.startsWith('http')) {
        window.open(item.url, '_blank');
      } else {
        window.location.href = item.url;
      }
    } else if (item.menu_type === 'category' && item.categories) {
      // Navegar para página da categoria
      navigate(`/categoria/${item.categories.id}`);
    }
  };
  const handleCityChange = (city: any) => {
    const cityName = `${city.name} - ${city.state}`;
    setSelectedCity(city.id, cityName);
    navigate(`/cidade/${city.id}`);
  };

  // Determine if login icon should be shown
  const shouldShowLoginIcon = !user || !authComplete && !loading;
  return <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40">
      
    </header>;
};
export default Header;