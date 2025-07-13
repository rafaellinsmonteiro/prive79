import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  User, 
  Image, 
  Briefcase, 
  Package, 
  Calendar, 
  Star,
  Filter,
  MapPin,
  Heart,
  Circle
} from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
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

  // Trigger search when term or category changes
  useEffect(() => {
    searchModels(debouncedSearchTerm, activeCategory);
  }, [debouncedSearchTerm, activeCategory]);

  // Filter results based on category
  const filteredResults = useMemo(() => {
    if (activeCategory === 'all' || activeCategory === 'profiles') {
      return results;
    }
    // For other categories, return empty array since we only have models for now
    return [];
  }, [results, activeCategory]);

  const renderResultCard = (result: any) => {
    return (
      <Card key={result.id} className="bg-card border-border hover:border-muted-foreground/20 transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src={result.image || undefined} alt={result.title} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              {result.type === 'model' && (
                <div className="absolute -bottom-1 -right-1">
                  <div className={`w-4 h-4 rounded-full border-2 border-background ${
                    result.is_online ? 'bg-green-500' : 'bg-muted-foreground'
                  }`} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg truncate">{result.title}</h3>
                  {result.age && (
                    <span className="text-sm text-muted-foreground">{result.age} anos</span>
                  )}
                </div>
                {result.is_online && (
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Online
                  </Badge>
                )}
              </div>
              
              {result.description && (
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{result.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {result.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{result.location}</span>
                  </div>
                )}
                {result.is_online !== undefined && (
                  <div className="flex items-center gap-1">
                    <Circle className={`h-3 w-3 ${result.is_online ? 'fill-green-500 text-green-500' : 'fill-muted-foreground text-muted-foreground'}`} />
                    <span>{result.is_online ? 'Disponível' : 'Indisponível'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button size="sm">
                Ver Perfil
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
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
        {/* Search Bar */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input
                  placeholder="Digite sua busca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <Button 
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={activeCategory === category.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.key)}
                className="flex items-center gap-2"
              >
                <category.icon className="h-4 w-4" />
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="text-white">
              <span className="font-semibold">{filteredResults.length}</span>
              <span className="text-zinc-400 ml-2">
                resultado{filteredResults.length !== 1 ? 's' : ''} encontrado{filteredResults.length !== 1 ? 's' : ''}
              </span>
            </div>
            {activeCategory !== 'all' && (
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                {categories.find(c => c.key === activeCategory)?.label}
              </Badge>
            )}
          </div>

          {/* Results List */}
          {loading ? (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Buscando...</p>
              </CardContent>
            </Card>
          ) : filteredResults.length > 0 ? (
            <div className="space-y-4">
              {filteredResults.map(renderResultCard)}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Nenhum resultado encontrado</h3>
                <p className="text-muted-foreground">
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
  );
};

export default SearchPage;