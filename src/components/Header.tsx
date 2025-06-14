import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu, MapPin, LogIn } from "lucide-react";
import { useCities } from "@/hooks/useCities";

const Header = () => {
  const [selectedCity, setSelectedCity] = useState("Aracaju - SE");
  const { data: cities = [] } = useCities();

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
                <DropdownMenuItem className="text-zinc-300 hover:text-zinc-100">
                  Início
                </DropdownMenuItem>
                <DropdownMenuItem className="text-zinc-300 hover:text-zinc-100">
                  Acompanhantes
                </DropdownMenuItem>
                <DropdownMenuItem className="text-zinc-300 hover:text-zinc-100">
                  Contato
                </DropdownMenuItem>
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
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-zinc-300 hover:text-zinc-100 transition-colors">
              Início
            </a>
            <a href="#" className="text-zinc-300 hover:text-zinc-100 transition-colors">
              Acompanhantes
            </a>
            <a href="#" className="text-zinc-300 hover:text-zinc-100 transition-colors">
              Contato
            </a>
          </nav>

          {/* Seletor de Cidades e Login */}
          <div className="flex items-center space-x-4">
            {/* Seletor de Cidades */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{selectedCity}</span>
                  <span className="sm:hidden">{selectedCity ? selectedCity.split(' - ')[1] : ''}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                {cities.map((city) => {
                  const cityName = `${city.name} - ${city.state}`;
                  return (
                    <DropdownMenuItem 
                      key={city.id}
                      onClick={() => setSelectedCity(cityName)}
                      className="text-zinc-300 hover:text-zinc-100"
                    >
                      {cityName}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Login Admin */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-zinc-400 hover:text-zinc-100"
              onClick={() => window.location.href = '/login'}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
