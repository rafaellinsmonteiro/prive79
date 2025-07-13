import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  User, 
  Image, 
  Briefcase, 
  Package, 
  Calendar, 
  Star,
  MapPin,
  Heart,
  Circle,
  Eye,
  Users,
  Grid3X3,
  List
} from 'lucide-react';
import { useSearch, SearchFilters } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [showsFace, setShowsFace] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const { results, loading, searchModels } = useSearch();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const categories = [
    { key: 'all', label: 'Todos', icon: Search },
    { key: 'profiles', label: 'Perfis', icon: User },
    { key: 'content', label: 'Conteúdos', icon: Image },
    { key: 'services', label: 'Serviços', icon: Briefcase },
    { key: 'products', label: 'Produtos', icon: Package },
    { key: 'events', label: 'Eventos', icon: Calendar },
    { key: 'reviews', label: 'Avaliações', icon: Star },
  ];

  // Trigger search when filters change
  useEffect(() => {
    const filters: SearchFilters = {
      searchTerm: debouncedSearchTerm,
      category: activeCategory,
      onlineOnly,
      showsFace,
    };
    searchModels(filters);
  }, [debouncedSearchTerm, activeCategory, onlineOnly, showsFace]);

  // Filter results based on category
  const filteredResults = useMemo(() => {
    if (activeCategory === 'all' || activeCategory === 'profiles') {
      return results;
    }
    // For other categories, return empty array since we only have models for now
    return [];
  }, [results, activeCategory]);

  const renderListCard = (result: any) => {
    return (
      <Card key={result.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Photo - Full square */}
            <div className="relative">
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-zinc-800">
                {result.image ? (
                  <img 
                    src={result.image} 
                    alt={result.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-16 w-16 text-zinc-500" />
                  </div>
                )}
              </div>
              {result.type === 'model' && (
                <div className="absolute -bottom-1 -right-1">
                  <div className={`w-6 h-6 rounded-full border-2 border-background ${
                    result.is_online ? 'bg-green-500' : 'bg-muted-foreground'
                  }`} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-xl truncate text-white">{result.title}</h3>
                  {result.age && (
                    <span className="text-zinc-400">{result.age} anos</span>
                  )}
                </div>
                {result.is_online && (
                  <Badge variant="default" className="bg-green-900 text-green-200 border-green-800">
                    Online
                  </Badge>
                )}
              </div>
              
              {result.description && (
                <p className="text-zinc-400 mb-4 line-clamp-3">{result.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                {result.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{result.location}</span>
                  </div>
                )}
                {result.is_online !== undefined && (
                  <div className="flex items-center gap-1">
                    <Circle className={`h-4 w-4 ${result.is_online ? 'fill-green-500 text-green-500' : 'fill-zinc-500 text-zinc-500'}`} />
                    <span>{result.is_online ? 'Disponível' : 'Indisponível'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Ver Perfil
              </Button>
              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderGridCard = (result: any) => {
    return (
      <Card key={result.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Photo - Full square */}
            <div className="relative mx-auto w-fit">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-zinc-800 mx-auto">
                {result.image ? (
                  <img 
                    src={result.image} 
                    alt={result.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-12 w-12 text-zinc-500" />
                  </div>
                )}
              </div>
              {result.type === 'model' && (
                <div className="absolute -bottom-1 -right-1">
                  <div className={`w-5 h-5 rounded-full border-2 border-background ${
                    result.is_online ? 'bg-green-500' : 'bg-muted-foreground'
                  }`} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-semibold truncate text-white">{result.title}</h3>
                {result.is_online && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
              
              {result.age && (
                <span className="text-sm text-zinc-400">{result.age} anos</span>
              )}
              
              {result.location && (
                <div className="flex items-center justify-center gap-1 text-xs text-zinc-500">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{result.location}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                Ver Perfil
              </Button>
              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white mb-2">Buscar</h1>
          <p className="text-zinc-400">Encontre perfis, serviços, produtos e muito mais</p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <Card className="bg-zinc-900 border-zinc-800 sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Search className="h-5 w-5" />
                  Filtros de Busca
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Input */}
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-zinc-300">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      id="search"
                      placeholder="Digite sua busca..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                {/* Categories */}
                <div className="space-y-3">
                  <Label className="text-zinc-300">Categorias</Label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category.key}
                        variant={activeCategory === category.key ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveCategory(category.key)}
                        className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800 data-[state=open]:bg-zinc-800"
                      >
                        <category.icon className="h-4 w-4 mr-2" />
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-zinc-800" />

                {/* Quick Filters */}
                <div className="space-y-4">
                  <Label className="text-zinc-300">Filtros Rápidos</Label>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="online-only" className="flex items-center gap-2 cursor-pointer text-zinc-300">
                      <Circle className="h-4 w-4 fill-green-500 text-green-500" />
                      Online agora
                    </Label>
                    <Switch
                      id="online-only"
                      checked={onlineOnly}
                      onCheckedChange={setOnlineOnly}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="shows-face" className="flex items-center gap-2 cursor-pointer text-zinc-300">
                      <Eye className="h-4 w-4" />
                      Mostra o rosto
                    </Label>
                    <Switch
                      id="shows-face"
                      checked={showsFace}
                      onCheckedChange={setShowsFace}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Quick Filter Badges */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">Filtros ativos:</span>
              {onlineOnly && (
                <Badge variant="default" className="bg-green-900 text-green-200 border-green-800">
                  <Circle className="h-3 w-3 mr-1 fill-current" />
                  Online agora
                </Badge>
              )}
              {showsFace && (
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                  <Eye className="h-3 w-3 mr-1" />
                  Mostra o rosto
                </Badge>
              )}
              {activeCategory !== 'all' && (
                <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                  {categories.find(c => c.key === activeCategory)?.label}
                </Badge>
              )}
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="text-white">
                <span className="font-semibold">{filteredResults.length}</span>
                <span className="text-zinc-400 ml-2">
                  resultado{filteredResults.length !== 1 ? 's' : ''} encontrado{filteredResults.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? '' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? '' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results List */}
            {loading ? (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-zinc-400">Buscando...</p>
                </CardContent>
              </Card>
            ) : filteredResults.length > 0 ? (
              viewMode === 'list' ? (
                <div className="space-y-4">
                  {filteredResults.map(renderListCard)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredResults.map(renderGridCard)}
                </div>
              )
            ) : (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2 text-white">Nenhum resultado encontrado</h3>
                  <p className="text-zinc-400">
                    {searchTerm.trim() 
                      ? "Tente ajustar sua busca ou explore outras categorias" 
                      : "Digite algo para começar a busca"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;