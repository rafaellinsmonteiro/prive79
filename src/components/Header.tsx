
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, MapPin, ChevronDown, LogIn } from "lucide-react";
import { useCities } from "@/hooks/useCities";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useAuth } from "@/hooks/useAuth";
import { useCity } from "@/contexts/CityContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { data: cities = [] } = useCities();
  const { user, authComplete, loading } = useAuth();
  const { selectedCityId, selectedCityName, setSelectedCity } = useCity();
  const navigate = useNavigate();
  
  // Debug logs
  console.log('Header render - user:', !!user, 'authComplete:', authComplete, 'loading:', loading);
  console.log('Header render - selectedCityId:', selectedCityId, 'selectedCityName:', selectedCityName);
  
  const { data: menuItems = [] } = useMenuItems(selectedCityId, !!user);

  console.log('Header - menuItems received:', menuItems);

  // Separar itens por tipo - apenas itens raiz (sem parent_id)
  const rootUrlItems = menuItems.filter(item => item.menu_type === 'url' && !item.parent_id);
  const rootCategoryItems = menuItems.filter(item => item.menu_type === 'category' && !item.parent_id);
  const parentItemsWithChildren = menuItems.filter(item => !item.parent_id && item.children && item.children.length > 0);

  console.log('Header - rootUrlItems:', rootUrlItems);
  console.log('Header - rootCategoryItems:', rootCategoryItems);
  console.log('Header - parentItemsWithChildren:', parentItemsWithChildren);

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
  const shouldShowLoginIcon = !user || (!authComplete && !loading);

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Menu Mobile */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-zinc-900 border-zinc-800">
                {/* Itens URL raiz (sem filhos) */}
                {rootUrlItems.map((item) => (
                  <DropdownMenuItem 
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                  >
                    {item.title}
                  </DropdownMenuItem>
                ))}
                
                {/* Itens categoria raiz (sem filhos) */}
                {rootCategoryItems.map((item) => (
                  <DropdownMenuItem 
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                  >
                    {item.categories?.name || item.title}
                  </DropdownMenuItem>
                ))}

                {/* Itens pais com submenus */}
                {parentItemsWithChildren.map((parentItem) => (
                  <DropdownMenuSub key={parentItem.id}>
                    <DropdownMenuSubTrigger className="text-zinc-300 hover:text-zinc-100 data-[state=open]:bg-zinc-800 hover:bg-zinc-800">
                      {parentItem.title}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                        {parentItem.children?.map((childItem) => (
                          <DropdownMenuItem 
                            key={childItem.id}
                            onClick={() => handleMenuClick(childItem)}
                            className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                          >
                            {childItem.menu_type === 'category' ? childItem.categories?.name || childItem.title : childItem.title}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Logo */}
          <div className="flex items-center">
            <a href="/">
              <img src="/lovable-uploads/97e61247-cb21-4158-8ebe-519e4fbec3e1.png" alt="Privé79 Logo" className="h-8" />
            </a>
          </div>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Itens URL raiz (sem filhos) */}
            {rootUrlItems.map((item) => (
              <a 
                key={item.id}
                href={item.url}
                className="text-zinc-300 hover:text-zinc-100 transition-colors"
              >
                {item.title}
              </a>
            ))}
            
            {/* Itens categoria raiz (sem filhos) */}
            {rootCategoryItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className="text-zinc-300 hover:text-zinc-100 transition-colors"
              >
                {item.categories?.name || item.title}
              </button>
            ))}

            {/* Itens pais com submenus */}
            {parentItemsWithChildren.map((parentItem) => (
              <DropdownMenu key={parentItem.id}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-950 data-[state=open]:bg-zinc-950">
                    {parentItem.title}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
                  {parentItem.children?.map((childItem) => (
                    <DropdownMenuItem 
                      key={childItem.id}
                      onClick={() => handleMenuClick(childItem)}
                      className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                      {childItem.menu_type === 'category' ? childItem.categories?.name || childItem.title : childItem.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </nav>

          {/* Área direita com Seletor de Cidades e Login */}
          <div className="flex items-center space-x-4">
            {/* Seletor de Cidades */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{selectedCityName}</span>
                  <span className="sm:hidden">{selectedCityName ? selectedCityName.split(' - ')[1] : ''}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                {cities.map((city) => {
                  const cityName = `${city.name} - ${city.state}`;
                  return (
                    <DropdownMenuItem 
                      key={city.id}
                      onClick={() => handleCityChange(city)}
                      className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                      {cityName}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Ícone de Login - mostra quando não há usuário ou quando auth ainda não completou */}
            {shouldShowLoginIcon && (
              <a href="/login">
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-white hover:text-black">
                  <LogIn className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
