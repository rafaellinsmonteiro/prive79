
import { useState } from "react";
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
import { Menu, MapPin, ChevronDown } from "lucide-react";
import { useCities } from "@/hooks/useCities";

const Header = () => {
  const [selectedCity, setSelectedCity] = useState("Aracaju - SE");
  const { data: cities = [] } = useCities();

  const tipos = [
    "Loiras",
    "Morenas",
    "Ruivas",
    "Massagistas",
    "Sugar Baby",
    "Duplas",
    "Todas"
  ];

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
                <DropdownMenuItem className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800">
                  Início
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-zinc-300 hover:text-zinc-100 data-[state=open]:bg-zinc-800 hover:bg-zinc-800">
                    Tipos
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                      {tipos.map((tipo) => (
                        <DropdownMenuItem key={tipo} className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800">
                          {tipo}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800">
                  Virtual
                </DropdownMenuItem>
                <DropdownMenuItem className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800">
                  Filtros
                </DropdownMenuItem>
                <DropdownMenuItem className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800">
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
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-zinc-300 hover:text-zinc-100 transition-colors">
              Início
            </a>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-950 data-[state=open]:bg-zinc-950">
                  Categorias
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
                {tipos.map((tipo) => (
                  <DropdownMenuItem key={tipo} className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800">
                    {tipo}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <a href="#" className="text-zinc-300 hover:text-zinc-100 transition-colors">
              Virtual
            </a>
            <a href="#" className="text-zinc-300 hover:text-zinc-100 transition-colors">
              Filtros
            </a>
            <a href="#" className="text-zinc-300 hover:text-zinc-100 transition-colors">
              Contato
            </a>
          </nav>

          {/* Seletor de Cidades */}
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
                      className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                      {cityName}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
