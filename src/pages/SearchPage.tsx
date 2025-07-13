import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Search, User, Image, Briefcase, Package, Calendar, Star, MapPin, Heart, Circle, Eye, Users, Grid3X3, List } from 'lucide-react';
import { useSearch, SearchFilters } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [showsFace, setShowsFace] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const {
    results,
    loading,
    searchModels
  } = useSearch();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const categories = [{
    key: 'all',
    label: 'Todos',
    icon: Search
  }, {
    key: 'profiles',
    label: 'Perfis',
    icon: User
  }, {
    key: 'content',
    label: 'Conteúdos',
    icon: Image
  }, {
    key: 'services',
    label: 'Serviços',
    icon: Briefcase
  }, {
    key: 'products',
    label: 'Produtos',
    icon: Package
  }, {
    key: 'events',
    label: 'Eventos',
    icon: Calendar
  }, {
    key: 'reviews',
    label: 'Avaliações',
    icon: Star
  }];

  // Trigger search when filters change
  useEffect(() => {
    const filters: SearchFilters = {
      searchTerm: debouncedSearchTerm,
      category: activeCategory,
      onlineOnly,
      showsFace
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
    return <Card key={result.id} className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20 hover:border-[hsl(var(--gold-primary))]/40 transition-all duration-300 cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_hsl(var(--gold-primary))_/_0.1]">
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Photo - Full square */}
            <div className="relative">
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-[hsl(var(--dark-primary))] ring-2 ring-[hsl(var(--gold-accent))]/20 group-hover:ring-[hsl(var(--gold-primary))]/40 transition-all duration-300">
                {result.image ? <img src={result.image} alt={result.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
                    <User className="h-16 w-16 text-[hsl(var(--dark-muted))]" />
                  </div>}
              </div>
              {result.type === 'model' && <div className="absolute -bottom-1 -right-1">
                  <div className={`w-6 h-6 rounded-full border-2 border-[hsl(var(--dark-card))] ${result.is_online ? 'bg-green-500 shadow-[0_0_8px_green_/_0.5]' : 'bg-[hsl(var(--dark-muted))]'}`} />
                </div>}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-xl truncate text-[hsl(var(--gold-primary))]">{result.title}</h3>
                  {result.age && <span className="text-[hsl(var(--dark-muted))]">{result.age} anos</span>}
                </div>
                {result.is_online && <Badge className="bg-gradient-to-r from-green-500/20 to-green-400/20 text-green-400 border-green-500/30 shadow-[0_2px_8px_green_/_0.2]">
                    Online
                  </Badge>}
              </div>
              
              {result.description && <p className="text-[hsl(var(--dark-muted))] mb-4 line-clamp-3">{result.description}</p>}
              
              <div className="flex items-center gap-4 text-sm text-[hsl(var(--dark-muted))]">
                {result.location && <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{result.location}</span>
                  </div>}
                {result.is_online !== undefined && <div className="flex items-center gap-1">
                    <Circle className={`h-4 w-4 ${result.is_online ? 'fill-green-500 text-green-500' : 'fill-[hsl(var(--dark-muted))] text-[hsl(var(--dark-muted))]'}`} />
                    <span>{result.is_online ? 'Disponível' : 'Indisponível'}</span>
                  </div>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button size="sm" className="bg-gradient-to-r from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))] text-[hsl(var(--dark-primary))] hover:from-[hsl(var(--gold-primary))]/90 hover:to-[hsl(var(--gold-accent))]/90 shadow-[0_4px_12px_hsl(var(--gold-primary))_/_0.3] font-medium">
                Ver Perfil
              </Button>
              <Button size="sm" variant="ghost" className="text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))] hover:bg-[hsl(var(--gold-accent))]/10">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>;
  };
  const renderGridCard = (result: any) => {
    return <Card key={result.id} className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20 hover:border-[hsl(var(--gold-primary))]/40 transition-all duration-300 cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_hsl(var(--gold-primary))_/_0.1]">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Photo - Full square */}
            <div className="relative mx-auto w-fit">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-[hsl(var(--dark-primary))] mx-auto ring-2 ring-[hsl(var(--gold-accent))]/20 group-hover:ring-[hsl(var(--gold-primary))]/40 transition-all duration-300">
                {result.image ? <img src={result.image} alt={result.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
                    <User className="h-12 w-12 text-[hsl(var(--dark-muted))]" />
                  </div>}
              </div>
              {result.type === 'model' && <div className="absolute -bottom-1 -right-1">
                  <div className={`w-5 h-5 rounded-full border-2 border-[hsl(var(--dark-card))] ${result.is_online ? 'bg-green-500 shadow-[0_0_8px_green_/_0.5]' : 'bg-[hsl(var(--dark-muted))]'}`} />
                </div>}
            </div>

            {/* Content */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-semibold truncate text-[hsl(var(--gold-primary))]">{result.title}</h3>
                {result.is_online && <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_4px_green_/_0.7]" />}
              </div>
              
              {result.age && <span className="text-sm text-[hsl(var(--dark-muted))]">{result.age} anos</span>}
              
              {result.location && <div className="flex items-center justify-center gap-1 text-xs text-[hsl(var(--dark-muted))]">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{result.location}</span>
                </div>}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-gradient-to-r from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))] text-[hsl(var(--dark-primary))] hover:from-[hsl(var(--gold-primary))]/90 hover:to-[hsl(var(--gold-accent))]/90 shadow-[0_4px_12px_hsl(var(--gold-primary))_/_0.3] font-medium">
                Ver Perfil
              </Button>
              <Button size="sm" variant="ghost" className="text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))] hover:bg-[hsl(var(--gold-accent))]/10">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>;
  };
  return <div className="min-h-screen bg-[hsl(var(--dark-primary))]">
      {/* Header */}
      

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20 sticky top-6 shadow-[0_4px_20px_hsl(var(--gold-primary))_/_0.1]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[hsl(var(--gold-primary))]">
                  <Search className="h-5 w-5" />
                  Filtros de Busca
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Input */}
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-[hsl(var(--dark-text))]">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--dark-muted))]" />
                    <Input id="search" placeholder="Digite sua busca..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-[hsl(var(--dark-primary))] border-[hsl(var(--gold-accent))]/30 text-[hsl(var(--dark-text))] placeholder:text-[hsl(var(--dark-muted))] focus:border-[hsl(var(--gold-primary))] focus:ring-[hsl(var(--gold-primary))]/20" />
                  </div>
                </div>

                <Separator className="bg-[hsl(var(--gold-accent))]/20" />

                {/* Categories */}
                <div className="space-y-3">
                  <Label className="text-[hsl(var(--dark-text))]">Categorias</Label>
                  <div className="space-y-2">
                    {categories.map(category => <Button key={category.key} variant={activeCategory === category.key ? "default" : "ghost"} size="sm" onClick={() => setActiveCategory(category.key)} className={`w-full justify-start transition-all duration-200 ${activeCategory === category.key ? "bg-gradient-to-r from-[hsl(var(--gold-primary))]/20 to-[hsl(var(--gold-accent))]/20 text-[hsl(var(--gold-primary))] border-l-2 border-[hsl(var(--gold-primary))] shadow-[0_4px_12px_hsl(var(--gold-primary))_/_0.2]" : "text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))] hover:bg-[hsl(var(--gold-accent))]/10"}`}>
                        <category.icon className="h-4 w-4 mr-2" />
                        {category.label}
                      </Button>)}
                  </div>
                </div>

                <Separator className="bg-[hsl(var(--gold-accent))]/20" />

                {/* Quick Filters */}
                <div className="space-y-4">
                  <Label className="text-[hsl(var(--dark-text))]">Filtros Rápidos</Label>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--dark-primary))] border border-[hsl(var(--gold-accent))]/20">
                    <Label htmlFor="online-only" className="flex items-center gap-2 cursor-pointer text-[hsl(var(--dark-text))]">
                      <Circle className="h-4 w-4 fill-green-500 text-green-500" />
                      Online agora
                    </Label>
                    <Switch id="online-only" checked={onlineOnly} onCheckedChange={setOnlineOnly} className="data-[state=checked]:bg-[hsl(var(--gold-primary))]" />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--dark-primary))] border border-[hsl(var(--gold-accent))]/20">
                    <Label htmlFor="shows-face" className="flex items-center gap-2 cursor-pointer text-[hsl(var(--dark-text))]">
                      <Eye className="h-4 w-4" />
                      Mostra o rosto
                    </Label>
                    <Switch id="shows-face" checked={showsFace} onCheckedChange={setShowsFace} className="data-[state=checked]:bg-[hsl(var(--gold-primary))]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Quick Filter Badges */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-[hsl(var(--dark-muted))]">Filtros ativos:</span>
              {onlineOnly && <Badge className="bg-gradient-to-r from-green-500/20 to-green-400/20 text-green-400 border-green-500/30 shadow-[0_2px_8px_green_/_0.2]">
                  <Circle className="h-3 w-3 mr-1 fill-current" />
                  Online agora
                </Badge>}
              {showsFace && <Badge className="bg-gradient-to-r from-[hsl(var(--gold-primary))]/20 to-[hsl(var(--gold-accent))]/20 text-[hsl(var(--gold-primary))] border-[hsl(var(--gold-primary))]/30 shadow-[0_2px_8px_hsl(var(--gold-primary))_/_0.2]">
                  <Eye className="h-3 w-3 mr-1" />
                  Mostra o rosto
                </Badge>}
              {activeCategory !== 'all' && <Badge variant="outline" className="border-[hsl(var(--gold-accent))]/40 text-[hsl(var(--dark-text))]">
                  {categories.find(c => c.key === activeCategory)?.label}
                </Badge>}
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="text-[hsl(var(--dark-text))]">
                <span className="font-semibold text-[hsl(var(--gold-primary))]">{filteredResults.length}</span>
                <span className="text-[hsl(var(--dark-muted))] ml-2">
                  resultado{filteredResults.length !== 1 ? 's' : ''} encontrado{filteredResults.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-[hsl(var(--dark-card))] p-1 rounded-lg border border-[hsl(var(--gold-accent))]/20">
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-gradient-to-r from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))] text-[hsl(var(--dark-primary))] shadow-[0_2px_8px_hsl(var(--gold-primary))_/_0.3]' : 'text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))] hover:bg-[hsl(var(--gold-accent))]/10'}>
                  <List className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-gradient-to-r from-[hsl(var(--gold-primary))] to-[hsl(var(--gold-accent))] text-[hsl(var(--dark-primary))] shadow-[0_2px_8px_hsl(var(--gold-primary))_/_0.3]' : 'text-[hsl(var(--dark-muted))] hover:text-[hsl(var(--gold-primary))] hover:bg-[hsl(var(--gold-accent))]/10'}>
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results List */}
            {loading ? <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--gold-primary))] mx-auto mb-4"></div>
                  <p className="text-[hsl(var(--dark-muted))]">Buscando...</p>
                </CardContent>
              </Card> : filteredResults.length > 0 ? viewMode === 'list' ? <div className="space-y-4">
                  {filteredResults.map(renderListCard)}
                </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredResults.map(renderGridCard)}
                </div> : <Card className="bg-[hsl(var(--dark-card))] border-[hsl(var(--gold-accent))]/20">
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-[hsl(var(--dark-muted))] mx-auto mb-4" />
                  <h3 className="font-semibold mb-2 text-[hsl(var(--dark-text))]">Nenhum resultado encontrado</h3>
                  <p className="text-[hsl(var(--dark-muted))]">
                    {searchTerm.trim() ? "Tente ajustar sua busca ou explore outras categorias" : "Digite algo para começar a busca"}
                  </p>
                </CardContent>
              </Card>}
          </div>
        </div>
      </div>
    </div>;
};
export default SearchPage;