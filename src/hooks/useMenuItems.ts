
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MenuItem {
  id: string;
  title: string;
  menu_type: 'url' | 'category';
  url?: string;
  category_id?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
  };
}

export interface MenuConfiguration {
  id: string;
  menu_item_id: string;
  city_id?: string;
  user_type: 'guest' | 'authenticated' | 'all';
  is_active: boolean;
  created_at: string;
}

export const useMenuItems = (cityId?: string, isAuthenticated?: boolean) => {
  return useQuery({
    queryKey: ['menu-items', cityId, isAuthenticated],
    queryFn: async (): Promise<MenuItem[]> => {
      // Buscar itens do menu com suas categorias
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (menuError) {
        console.error('Error fetching menu items:', menuError);
        throw menuError;
      }

      // Buscar configurações do menu
      let configQuery = supabase
        .from('menu_configurations')
        .select('*')
        .eq('is_active', true);

      // Filtrar por cidade (se especificada ou todas as cidades)
      if (cityId) {
        configQuery = configQuery.or(`city_id.eq.${cityId},city_id.is.null`);
      } else {
        configQuery = configQuery.is('city_id', null);
      }

      // Filtrar por tipo de usuário
      const userType = isAuthenticated ? 'authenticated' : 'guest';
      configQuery = configQuery.or(`user_type.eq.${userType},user_type.eq.all`);

      const { data: configurations, error: configError } = await configQuery;

      if (configError) {
        console.error('Error fetching menu configurations:', configError);
        throw configError;
      }

      // Filtrar itens do menu baseado nas configurações
      const visibleMenuItemIds = new Set(configurations?.map(config => config.menu_item_id) || []);
      
      return menuItems?.filter(item => visibleMenuItemIds.has(item.id)) || [];
    },
  });
};
