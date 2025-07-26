import React, { useState, useEffect } from 'react';
import DarkLayout from '@/components/DarkLayout';
import { useSearch, SearchFilters } from '@/hooks/useSearch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Search, Filter, MapPin, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ClientV2SearchPage() {
  const navigate = useNavigate();
  const { results, loading, searchModels } = useSearch();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    onlineOnly: false,
    showsFace: false,
    cityId: '',
    minAge: 18,
    maxAge: 65,
  });

  const handleSearch = () => {
    searchModels(filters);
  };

  useEffect(() => {
    // Buscar modelos automaticamente quando a página carrega
    searchModels(filters);
  }, []);

  const handleModelClick = (modelId: string) => {
    navigate(`/modelo/${modelId}`);
  };

  const handleChatClick = (modelId: string) => {
    navigate(`/cliente/chat?model=${modelId}`);
  };

  return (
    <DarkLayout title="Buscar">
      <div className="p-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar modelos por nome, cidade..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="pl-10 bg-card border-border text-foreground"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            onClick={handleSearch}
            className="absolute right-2 top-2 h-7"
            size="sm"
          >
            Buscar
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full justify-between bg-card border-border text-foreground hover:bg-accent"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </div>
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              {Object.values(filters).filter(v => v === true || (typeof v === 'string' && v !== '' && v !== 'all')).length}
            </Badge>
          </Button>

          {showFilters && (
            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Apenas online</label>
                  <Switch
                    checked={filters.onlineOnly}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlineOnly: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Mostra o rosto</label>
                  <Switch
                    checked={filters.showsFace}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showsFace: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="bg-muted rounded-lg h-48"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((model) => (
                <Card 
                  key={model.id} 
                  className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleModelClick(model.id)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="relative">
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                        {model.image ? (
                          <img
                            src={model.image}
                            alt={model.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Avatar className="w-20 h-20">
                              <AvatarFallback className="bg-muted-foreground/20 text-muted-foreground text-lg">
                                {model.title.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                      {model.is_online && (
                        <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                          <Clock className="w-3 h-3 mr-1" />
                          Online
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground truncate">{model.title}</h3>
                        <span className="text-sm text-muted-foreground">{model.age} anos</span>
                      </div>
                      
                      {model.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {model.location}
                        </div>
                      )}

                      {model.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {model.description}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChatClick(model.id);
                          }}
                        >
                          Chat
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent border-border text-foreground hover:bg-accent"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleModelClick(model.id);
                          }}
                        >
                          Ver Perfil
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum resultado encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou buscar por outros termos.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DarkLayout>
  );
}