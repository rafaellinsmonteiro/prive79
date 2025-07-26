import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X, Eye, EyeOff, Users, MapPin } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useCities } from '@/hooks/useCities';

interface ModelsFiltersProps {
  onFiltersChange: (filters: ModelsFilterState) => void;
  totalModels: number;
  filteredCount: number;
}

export interface ModelsFilterState {
  search: string;
  status: 'all' | 'active' | 'inactive';
  cityId: string;
  categoryId: string;
  ageMin: string;
  ageMax: string;
  hasPhotos: boolean | null;
  sortBy: 'name' | 'age' | 'created_at' | 'display_order';
  sortOrder: 'asc' | 'desc';
}

const defaultFilters: ModelsFilterState = {
  search: '',
  status: 'all',
  cityId: '',
  categoryId: '',
  ageMin: '',
  ageMax: '',
  hasPhotos: null,
  sortBy: 'display_order',
  sortOrder: 'asc',
};

const ModelsFilters = ({ onFiltersChange, totalModels, filteredCount }: ModelsFiltersProps) => {
  const [filters, setFilters] = useState<ModelsFilterState>(defaultFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: categories = [] } = useCategories();
  const { data: cities = [] } = useCities();

  const updateFilters = (newFilters: Partial<ModelsFilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.search !== '' ||
      filters.status !== 'all' ||
      filters.cityId !== '' ||
      filters.categoryId !== '' ||
      filters.ageMin !== '' ||
      filters.ageMax !== '' ||
      filters.hasPhotos !== null
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header com busca e estatísticas */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome..."
                  value={filters.search}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{filteredCount} de {totalModels} modelos</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
                {hasActiveFilters() && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {Object.values(filters).filter(value => 
                      value !== '' && value !== 'all' && value !== null && value !== 'display_order' && value !== 'asc'
                    ).length}
                  </Badge>
                )}
              </Button>
              
              {hasActiveFilters() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Filtros expandidos */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value: 'all' | 'active' | 'inactive') => updateFilters({ status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Ativas
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center gap-2">
                        <EyeOff className="w-4 h-4" />
                        Inativas
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cidade */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cidade</Label>
                <Select
                  value={filters.cityId}
                  onValueChange={(value) => updateFilters({ cityId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as cidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as cidades</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {city.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Categoria</Label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) => updateFilters({ categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenação */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ordenar por</Label>
                <div className="flex gap-2">
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value: 'name' | 'age' | 'created_at' | 'display_order') => updateFilters({ sortBy: value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="display_order">Ordem</SelectItem>
                      <SelectItem value="name">Nome</SelectItem>
                      <SelectItem value="age">Idade</SelectItem>
                      <SelectItem value="created_at">Data</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value: 'asc' | 'desc') => updateFilters({ sortOrder: value })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">↑</SelectItem>
                      <SelectItem value="desc">↓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Faixa etária */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Idade</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filters.ageMin}
                    onChange={(e) => updateFilters({ ageMin: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.ageMax}
                    onChange={(e) => updateFilters({ ageMax: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Fotos */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fotos</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-photos"
                      checked={filters.hasPhotos === true}
                      onCheckedChange={(checked) => 
                        updateFilters({ hasPhotos: checked ? true : null })
                      }
                    />
                    <Label htmlFor="has-photos" className="text-sm">Com fotos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="no-photos"
                      checked={filters.hasPhotos === false}
                      onCheckedChange={(checked) => 
                        updateFilters({ hasPhotos: checked ? false : null })
                      }
                    />
                    <Label htmlFor="no-photos" className="text-sm">Sem fotos</Label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelsFilters;