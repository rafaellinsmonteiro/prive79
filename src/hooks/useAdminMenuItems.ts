import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem, MenuConfiguration } from "./useMenuItems";

export const useAdminMenuItems = () => {
  return useQuery({
    queryKey: ['admin-menu-items'],
    queryFn: async (): Promise<MenuItem[]> => {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching admin menu items:', error);
        throw error;
      }

      // Organizar em hierarquia
      const itemsMap = new Map<string, MenuItem>();
      const rootItems: MenuItem[] = [];

      // Primeiro, criar o mapa de todos os itens
      (data || []).forEach(item => {
        itemsMap.set(item.id, { ...item, children: [] });
      });

      // Depois, organizar a hierarquia
      (data || []).forEach(item => {
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

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'categories' | 'children'>) => {
      console.log('Creating menu item with data:', itemData);
      
      const { data, error } = await supabase
        .from('menu_items')
        .insert(itemData)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating menu item:', error);
        throw error;
      }
      
      console.log('Menu item created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MenuItem> & { id: string }) => {
      console.log('Updating menu item with id:', id, 'and data:', updates);
      
      // Remover campos que não existem na tabela
      const cleanUpdates = { ...updates };
      delete (cleanUpdates as any).categories;
      delete (cleanUpdates as any).children;
      delete (cleanUpdates as any).created_at;
      delete (cleanUpdates as any).updated_at;
      
      const { data, error } = await supabase
        .from('menu_items')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating menu item:', error);
        throw error;
      }
      
      console.log('Menu item updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting menu item with id:', id);
      
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting menu item:', error);
        throw error;
      }
      
      console.log('Menu item deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
};

export const useUpdateMenuItemOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: { id: string; display_order: number }[]) => {
      console.log('Updating menu item order:', items);
      
      const updates = items.map(item => 
        supabase
          .from('menu_items')
          .update({ display_order: item.display_order })
          .eq('id', item.id)
      );

      const results = await Promise.all(updates);
      
      // Verificar erros
      for (const result of results) {
        if (result.error) {
          console.error('Error updating menu item order:', result.error);
          throw result.error;
        }
      }
      
      console.log('Menu item order updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
};

// Hook para gerenciar configurações de menu
export const useMenuConfigurations = (menuItemId?: string) => {
  return useQuery({
    queryKey: ['menu-configurations', menuItemId],
    queryFn: async (): Promise<MenuConfiguration[]> => {
      let query = supabase
        .from('menu_configurations')
        .select('*')
        .order('created_at', { ascending: true });

      if (menuItemId) {
        query = query.eq('menu_item_id', menuItemId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching menu configurations:', error);
        throw error;
      }

      return (data || []) as MenuConfiguration[];
    },
    enabled: !!menuItemId,
  });
};

export const useCreateMenuConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configData: Omit<MenuConfiguration, 'id' | 'created_at'>) => {
      console.log('Creating menu configuration with data:', configData);
      
      const { data, error } = await supabase
        .from('menu_configurations')
        .insert(configData as any)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating menu configuration:', error);
        throw error;
      }
      
      console.log('Menu configuration created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-configurations'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
};

export const useDeleteMenuConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting menu configuration with id:', id);
      
      const { error } = await supabase
        .from('menu_configurations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting menu configuration:', error);
        throw error;
      }
      
      console.log('Menu configuration deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-configurations'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
  });
};
