
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, Heart, MessageSquare, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useSearch, SearchFilters } from '@/hooks/useSearch';
import { useCategories } from '@/hooks/useCategories';

const SearchPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    category: 'all',
    onlineOnly: false,
    showsFace: false,
  });

  const { results, loading, searchModels } = useSearch();
  const { data: categories = [] } = useCategories();

  const handleFilterToggle = (filterType: string) => {
    switch (filterType) {
      case 'online':
        setFilters(prev => ({ ...prev, onlineOnly: !prev.onlineOnly }));
        break;
      case 'verified':
        setFilters(prev => ({ ...prev, showsFace: !prev.showsFace }));
        break;
      default:
        // Handle category filters
        setFilters(prev => ({ ...prev, category: prev.category === filterType ? 'all' : filterType }));
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
  };

  // Trigger search when filters change
  useEffect(() => {
    searchModels(filters);
  }, [filters, searchModels]);

  // Handler functions
  const handleChat = (model: any) => {
    navigate(`/v2/chat?model=${model.id}`);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-700 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <Input
                value={filters.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar modelos..."
                className="pl-10 bg-zinc-800 border-zinc-600 text-white"
              />
            </div>
            <Button variant="outline" className="border-zinc-600 text-zinc-300">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge 
              variant={filters.onlineOnly ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => handleFilterToggle('online')}
            >
              Online Agora
            </Badge>
            <Badge 
              variant={filters.showsFace ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => handleFilterToggle('verified')}
            >
              Mostram o Rosto
            </Badge>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={filters.category === 'all' ? 'default' : 'outline'}
              className="cursor-pointer border-zinc-600 text-zinc-300"
              onClick={() => handleFilterToggle('all')}
            >
              Todas
            </Badge>
            {categories.map(category => (
              <Badge
                key={category.id}
                variant={filters.category === category.id ? 'default' : 'outline'}
                className="cursor-pointer border-zinc-600 text-zinc-300"
                onClick={() => handleFilterToggle(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto p-4">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {loading ? 'Buscando...' : `${results.length} modelos encontradas`}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Ordenar por:</span>
            <select className="bg-zinc-800 border border-zinc-600 text-white text-sm rounded px-2 py-1">
              <option>Relevância</option>
              <option>Mais Recentes</option>
              <option>Melhor Avaliação</option>
              <option>Menor Preço</option>
              <option>Maior Preço</option>
            </select>
          </div>
        </div>

        {/* Models Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="bg-zinc-900 border-zinc-700 overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-zinc-800" />
                <CardContent className="p-4">
                  <div className="h-6 bg-zinc-800 rounded mb-2" />
                  <div className="h-4 bg-zinc-800 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map(model => (
              <Card 
                key={model.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-zinc-900 border-zinc-700 overflow-hidden"
                onClick={() => navigate(`/modelo/${model.id}`)}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={model.image || '/placeholder.svg'}
                    alt={model.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  
                  {/* Status Online */}
                  {model.is_online && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white border-0">
                        Online
                      </Badge>
                    </div>
                  )}

                  {/* Categorias */}
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                    <Badge
                      variant="secondary"
                      className="bg-black/60 text-white border-0 text-xs"
                    >
                      {model.category}
                    </Badge>
                  </div>

                {/* Overlay com botões */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChat(model);
                    }}
                    className="bg-white/90 text-black hover:bg-white"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/modelo/${model.id}`);
                    }}
                    className="bg-white/90 text-black hover:bg-white"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-white group-hover:text-pink-400 transition-colors">
                        {model.title}
                      </h3>
                      <p className="text-sm text-zinc-400">{model.age} anos</p>
                    </div>
                    
                    {model.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-zinc-300">{model.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-zinc-400 text-sm mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{model.location || model.city}</span>
                  </div>

                  {model.description && (
                    <p className="text-zinc-400 text-sm mb-2 line-clamp-2">
                      {model.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChat(model);
                      }}
                      className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white flex-1"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/modelo/${model.id}`);
                      }}
                      className="bg-pink-500 hover:bg-pink-600 text-white flex-1"
                    >
                      Ver Perfil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {results.length > 0 && !loading && (
          <div className="text-center mt-8">
            <Button variant="outline" className="border-zinc-600 text-zinc-300">
              Carregar mais modelos
            </Button>
          </div>
        )}

        {/* No Results */}
        {results.length === 0 && !loading && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Nenhuma modelo encontrada
            </h3>
            <p className="text-zinc-400 mb-4">
              Tente ajustar seus filtros ou termo de busca
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  searchTerm: '',
                  category: 'all',
                  onlineOnly: false,
                  showsFace: false,
                });
              }}
              className="border-zinc-600 text-zinc-300"
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
