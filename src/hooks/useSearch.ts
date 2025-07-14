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

export interface SearchFilters {
  searchTerm: string;
  category: string;
  onlineOnly: boolean;
  showsFace: boolean;
  myLocation?: boolean;
  videoCall?: boolean;
}

export const useSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchModels = async (filters: SearchFilters) => {
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
          allowed_plan_ids,
          cities:city_id(name),
          model_photos!inner(photo_url, show_in_profile),
          model_categories!left(
            categories!inner(name)
          )
        `)
        .eq('is_active', true)
        .or('allowed_plan_ids.is.null,allowed_plan_ids.eq.{}') // Apenas modelos sem restrição de planos
        .limit(1, { foreignTable: 'model_photos' });

      // Apply search filter
      if (filters.searchTerm.trim()) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,city.ilike.%${filters.searchTerm}%`);
      }

      // Apply online filter
      if (filters.onlineOnly) {
        query = query.eq('is_online', true);
      }

      // Apply shows face filter (models with profile photos visible)
      if (filters.showsFace) {
        query = query.eq('model_photos.show_in_profile', true);
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
      if (filters.category === 'profiles') {
        // Already filtered to models only
      } else if (filters.category !== 'all') {
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