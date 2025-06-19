
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MenuItem {
  id: string;
  title: string;
  menu_type: 'url' | 'category';
  url?: string;
  category_id?: string;
  parent_id?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
  };
  children?: MenuItem[];
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
      const visibleItems = menuItems?.filter(item => visibleMenuItemIds.has(item.id)) || [];

      // Organizar itens em hierarquia (pais e filhos)
      const itemsMap = new Map<string, MenuItem>();
      const rootItems: MenuItem[] = [];

      // Primeiro, criar o mapa de todos os itens
      visibleItems.forEach(item => {
        itemsMap.set(item.id, { ...item, children: [] });
      });

      // Depois, organizar a hierarquia
      visibleItems.forEach(item => {
        const menuItem = itemsMap.get(item.id)!;
        
        if (item.parent_id && itemsMap.has(item.parent_id)) {
          // É um item filho
          const parent = itemsMap.get(item.parent_id)!;
          parent.children = parent.children || [];
          parent.children.push(menuItem);
        } else {
          // É um item raiz
          rootItems.push(menuItem);
        }
      });

      // Ordenar filhos dentro de cada pai
      rootItems.forEach(item => {
        if (item.children) {
          item.children.sort((a, b) => a.display_order - b.display_order);
        }
      });

      return rootItems;
    },
  });
};
