
import React, { useState } from 'react';
import { Search, Filter, MapPin, Star, Heart, MessageSquare, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  // Mock data - replace with real data from your API
  const mockModels = [
    {
      id: '1',
      name: 'Isabella Silva',
      age: 24,
      location: 'São Paulo, SP',
      rating: 4.9,
      price: 200,
      photos: [{ id: '1', photo_url: '/placeholder.svg', is_primary: true }],
      is_online: true,
      categories: [
        { id: '1', name: 'Acompanhante', color: '#FF6B6B' },
        { id: '2', name: 'Massagista', color: '#4ECDC4' }
      ]
    },
    {
      id: '2',
      name: 'Camila Santos',
      age: 22,
      location: 'Rio de Janeiro, RJ',
      rating: 4.8,
      price: 180,
      photos: [{ id: '2', photo_url: '/placeholder.svg', is_primary: true }],
      is_online: false,
      categories: [
        { id: '1', name: 'Acompanhante', color: '#FF6B6B' }
      ]
    },
  ];

  const categories = [
    { id: '1', name: 'Acompanhante', color: '#FF6B6B' },
    { id: '2', name: 'Massagista', color: '#4ECDC4' },
    { id: '3', name: 'Modelo', color: '#45B7D1' },
    { id: '4', name: 'Dançarina', color: '#96CEB4' },
  ];

  const locations = [
    'São Paulo, SP',
    'Rio de Janeiro, RJ',
    'Belo Horizonte, MG',
    'Salvador, BA',
    'Fortaleza, CE',
    'Brasília, DF',
  ];

  const priceRanges = [
    { label: 'Até R$ 100', value: '0-100' },
    { label: 'R$ 100 - R$ 200', value: '100-200' },
    { label: 'R$ 200 - R$ 300', value: '200-300' },
    { label: 'Acima de R$ 300', value: '300+' },
  ];

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredModels = mockModels.filter(model => {
    if (searchTerm && !model.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Add more filtering logic here based on selectedFilters
    return true;
  });

  // Handler functions
  const handleChat = (model: any) => {
    navigate(`/v2/chat?model=${model.id}`);
  };
  const handleViewMedia = (model: any) => {
    setSelectedModel(model);
  };
  const handleBooking = (model: any) => {
    navigate(`/agendar?model=${model.id}`);
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              variant={selectedFilters.includes('online') ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => handleFilterToggle('online')}
            >
              Online Agora
            </Badge>
            <Badge 
              variant={selectedFilters.includes('verified') ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => handleFilterToggle('verified')}
            >
              Verificadas
            </Badge>
            <Badge 
              variant={selectedFilters.includes('new') ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => handleFilterToggle('new')}
            >
              Novatas
            </Badge>
            <Badge 
              variant={selectedFilters.includes('premium') ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => handleFilterToggle('premium')}
            >
              Premium
            </Badge>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge
                key={category.id}
                variant={selectedFilters.includes(category.id) ? 'default' : 'outline'}
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
            {filteredModels.length} modelos encontradas
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModels.map(model => (
            <Card 
              key={model.id}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-zinc-900 border-zinc-700 overflow-hidden"
              onClick={() => navigate(`/modelo/${model.id}`)}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={model.photos[0]?.photo_url || '/placeholder.svg'}
                  alt={model.name}
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
                  {model.categories.slice(0, 2).map((category) => (
                    <Badge
                      key={category.id}
                      variant="secondary"
                      className="bg-black/60 text-white border-0 text-xs"
                    >
                      {category.name}
                    </Badge>
                  ))}
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
                      handleViewMedia(model);
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
                      {model.name}
                    </h3>
                    <p className="text-sm text-zinc-400">{model.age} anos</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-zinc-300">{model.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-zinc-400 text-sm mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{model.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-pink-400 font-semibold">
                    R$ {model.price}/hora
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChat(model);
                      }}
                      className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBooking(model);
                      }}
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      Agendar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {filteredModels.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="border-zinc-600 text-zinc-300">
              Carregar mais modelos
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredModels.length === 0 && (
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
                setSearchTerm('');
                setSelectedFilters([]);
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
