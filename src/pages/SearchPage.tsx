import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Heart
} from 'lucide-react';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { key: 'all', label: 'Todos', icon: Search },
    { key: 'profiles', label: 'Perfis', icon: User },
    { key: 'content', label: 'Conteúdos', icon: Image },
    { key: 'services', label: 'Serviços', icon: Briefcase },
    { key: 'products', label: 'Produtos', icon: Package },
    { key: 'events', label: 'Eventos', icon: Calendar },
    { key: 'reviews', label: 'Avaliações', icon: Star },
  ];

  const mockResults = [
    {
      id: '1',
      type: 'profile',
      title: 'Maria Silva',
      description: 'Modelo profissional especializada em fashion e lifestyle',
      image: '/placeholder.svg',
      location: 'São Paulo, SP',
      rating: 4.8,
      category: 'profiles'
    },
    {
      id: '2',
      type: 'service',
      title: 'Ensaio Fotográfico Profissional',
      description: 'Sessão completa de fotos com edição profissional incluída',
      price: 'R$ 350',
      rating: 4.9,
      category: 'services'
    },
    {
      id: '3',
      type: 'event',
      title: 'Workshop de Modelagem',
      description: 'Aprenda técnicas profissionais de postura e expressão',
      date: '15 Dez 2024',
      location: 'Centro de Convenções - SP',
      category: 'events'
    }
  ];

  const filteredResults = mockResults.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const renderResultCard = (result: any) => {
    return (
      <Card key={result.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Image/Avatar */}
            <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
              {result.type === 'profile' && <User className="h-8 w-8 text-zinc-400" />}
              {result.type === 'service' && <Briefcase className="h-8 w-8 text-zinc-400" />}
              {result.type === 'event' && <Calendar className="h-8 w-8 text-zinc-400" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-semibold text-lg truncate">{result.title}</h3>
                {result.price && (
                  <span className="text-primary font-bold text-lg">{result.price}</span>
                )}
              </div>
              
              <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{result.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                {result.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{result.location}</span>
                  </div>
                )}
                {result.date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{result.date}</span>
                  </div>
                )}
                {result.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span>{result.rating}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Ver Detalhes
              </Button>
              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white">
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
          {filteredResults.length > 0 ? (
            <div className="space-y-4">
              {filteredResults.map(renderResultCard)}
            </div>
          ) : (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Nenhum resultado encontrado</h3>
                <p className="text-zinc-400">
                  Tente ajustar sua busca ou explore outras categorias
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