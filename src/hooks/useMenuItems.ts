
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

      console.log('useMenuItems - visibleItems before hierarchy:', visibleItems);

      // Organizar itens em hierarquia (pais e filhos)
      const itemsMap = new Map<string, MenuItem>();
      const rootItems: MenuItem[] = [];

      // Primeiro, criar o mapa de todos os itens e inicializar children
      visibleItems.forEach(item => {
        itemsMap.set(item.id, { ...item, children: [] });
      });

      console.log('useMenuItems - itemsMap after initialization:', Array.from(itemsMap.entries()));

      // Depois, organizar a hierarquia apenas para itens com parent_id válido
      visibleItems.forEach(item => {
        const menuItem = itemsMap.get(item.id)!;
        
        // Só organizar como filho se parent_id existe E o pai também existe no mapa
        if (item.parent_id && itemsMap.has(item.parent_id)) {
          console.log(`useMenuItems - Adding ${item.title} as child of parent ${item.parent_id}`);
          const parent = itemsMap.get(item.parent_id)!;
          parent.children = parent.children || [];
          parent.children.push(menuItem);
        } else {
          // É um item raiz (sem parent_id ou parent_id não existe no conjunto visível)
          console.log(`useMenuItems - Adding ${item.title} as root item (parent_id: ${item.parent_id})`);
          rootItems.push(menuItem);
        }
      });

      console.log('useMenuItems - rootItems after hierarchy:', rootItems);

      // Ordenar filhos dentro de cada pai
      rootItems.forEach(item => {
        if (item.children && item.children.length > 0) {
          item.children.sort((a, b) => a.display_order - b.display_order);
          console.log(`useMenuItems - Sorted children for ${item.title}:`, item.children.map(c => c.title));
        }
      });

      // Ordenar itens raiz
      rootItems.sort((a, b) => a.display_order - b.display_order);

      console.log('useMenuItems - final rootItems:', rootItems);
      return rootItems;
    },
  });
};
