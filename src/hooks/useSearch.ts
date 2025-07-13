import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SearchResult {
  id: string;
  type: 'model';
  title: string;
  description: string | null;
  image: string | null;
  location: string | null;
  rating?: number;
  category: string;
  age: number;
  city?: string;
  is_online?: boolean;
}

export const useSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchModels = async (searchTerm: string, categoryFilter: string) => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('models')
        .select(`
          id,
          name,
          description,
          age,
          city,
          is_online,
          is_active,
          cities:city_id(name),
          model_photos!inner(photo_url),
          model_categories!left(
            categories!inner(name)
          )
        `)
        .eq('is_active', true)
        .limit(1, { foreignTable: 'model_photos' });

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }

      const { data: models, error } = await query;

      if (error) {
        console.error('Search error:', error);
        toast({
          title: "Erro na busca",
          description: "Não foi possível realizar a busca. Tente novamente.",
          variant: "destructive",
        });
        setResults([]);
        return;
      }

      // Transform the data to match SearchResult interface
      const searchResults: SearchResult[] = (models || []).map(model => {
        const cityName = model.cities?.name || model.city || '';
        const primaryPhoto = model.model_photos?.[0]?.photo_url || null;
        const categories = model.model_categories?.map(mc => mc.categories?.name).filter(Boolean) || [];
        
        return {
          id: model.id,
          type: 'model' as const,
          title: model.name,
          description: model.description,
          image: primaryPhoto,
          location: cityName,
          category: 'profiles',
          age: model.age,
          city: cityName,
          is_online: model.is_online || false,
        };
      });

      // Apply category filter
      let filteredResults = searchResults;
      if (categoryFilter === 'profiles') {
        // Already filtered to models only
      } else if (categoryFilter !== 'all') {
        // For other categories, return empty for now since we're only searching models
        filteredResults = [];
      }

      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    searchModels,
  };
};