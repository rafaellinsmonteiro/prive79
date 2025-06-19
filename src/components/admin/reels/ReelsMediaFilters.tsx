
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { City } from '@/hooks/useCities';

interface Model {
  id: string;
  name: string;
  city_id: string;
}

interface ReelsMediaFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCityId: string;
  setSelectedCityId: (cityId: string) => void;
  selectedModelId: string;
  setSelectedModelId: (modelId: string) => void;
  showOnlyFeatured: boolean;
  setShowOnlyFeatured: (show: boolean) => void;
  cities: City[];
  models: Model[];
  onClearFilters: () => void;
}

const ReelsMediaFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCityId,
  setSelectedCityId,
  selectedModelId,
  setSelectedModelId,
  showOnlyFeatured,
  setShowOnlyFeatured,
  cities,
  models,
  onClearFilters
}: ReelsMediaFiltersProps) => {
  // Ultra-comprehensive filtering to prevent Select.Item errors
  const validCities = cities.filter(city => {
    const hasValidId = city?.id && typeof city.id === 'string' && city.id.trim() !== '' && city.id !== 'undefined' && city.id !== 'null';
    const hasValidName = city?.name && typeof city.name === 'string' && city.name.trim() !== '';
    
    if (!hasValidId || !hasValidName) {
      console.warn('ReelsMediaFilters: Filtering invalid city', { city, hasValidId, hasValidName });
      return false;
    }
    return true;
  });

  const validModels = models.filter(model => {
    const hasValidId = model?.id && typeof model.id === 'string' && model.id.trim() !== '' && model.id !== 'undefined' && model.id !== 'null';
    const hasValidName = model?.name && typeof model.name === 'string' && model.name.trim() !== '';
    
    if (!hasValidId || !hasValidName) {
      console.warn('ReelsMediaFilters: Filtering invalid model', { model, hasValidId, hasValidName });
      return false;
    }
    return true;
  });

  // Filter models based on selected city
  const filteredModels = selectedCityId 
    ? validModels.filter(model => model.city_id === selectedCityId)
    : validModels;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
        <Input
          placeholder="Buscar por modelo ou título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-zinc-800 border-zinc-700 text-white"
        />
      </div>

      {/* City Filter */}
      <Select value={selectedCityId} onValueChange={setSelectedCityId}>
        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
          <SelectValue placeholder="Filtrar por cidade" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700">
          <SelectItem value="">Todas as cidades</SelectItem>
          {validCities.length > 0 ? (
            validCities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-cities-available" disabled>
              Nenhuma cidade disponível
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Model Filter */}
      <Select value={selectedModelId} onValueChange={setSelectedModelId}>
        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
          <SelectValue placeholder="Filtrar por modelo" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700">
          <SelectItem value="">Todas as modelos</SelectItem>
          {filteredModels.length > 0 ? (
            filteredModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-models-available" disabled>
              Nenhuma modelo disponível
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant={showOnlyFeatured ? "default" : "outline"}
          size="sm"
          onClick={() => setShowOnlyFeatured(!showOnlyFeatured)}
          className="flex-1"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showOnlyFeatured ? 'Todos' : 'Só Reels'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
        >
          Limpar
        </Button>
      </div>
    </div>
  );
};

export default ReelsMediaFilters;
