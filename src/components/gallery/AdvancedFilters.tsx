
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Filter, X } from 'lucide-react';
import { useCities } from '@/hooks/useCities';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: {
    city?: string;
    minAge?: number;
    maxAge?: number;
  }) => void;
}

const AdvancedFilters = ({ onFiltersChange }: AdvancedFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 45]);
  
  const { data: cities = [] } = useCities();

  useEffect(() => {
    onFiltersChange({
      city: selectedCity === 'all' ? undefined : selectedCity,
      minAge: ageRange[0],
      maxAge: ageRange[1]
    });
  }, [selectedCity, ageRange, onFiltersChange]);

  const clearFilters = () => {
    setSelectedCity('all');
    setAgeRange([18, 45]);
  };

  const hasActiveFilters = selectedCity !== 'all' || ageRange[0] !== 18 || ageRange[1] !== 45;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros Avançados
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2 text-zinc-400"
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {showFilters && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Filtro de Cidade */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Cidade
                </label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Todas as cidades" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all" className="text-white hover:bg-zinc-700 focus:bg-zinc-700">
                      Todas as cidades
                    </SelectItem>
                    {cities.map((city) => (
                      <SelectItem 
                        key={city.id} 
                        value={city.id}
                        className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                      >
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Idade */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Idade: {ageRange[0]} - {ageRange[1]} anos
                </label>
                <div className="px-2 mt-4">
                  <Slider
                    value={ageRange}
                    onValueChange={(value) => setAgeRange(value as [number, number])}
                    min={18}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedFilters;
