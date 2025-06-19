import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateMenuItem, useUpdateMenuItem, useAdminMenuItems } from '@/hooks/useAdminMenuItems';
import { useAdminCategories } from '@/hooks/useAdminCategories';
import { useCities } from '@/hooks/useCities';
import { MenuItem } from '@/hooks/useMenuItems';
import { useToast } from '@/hooks/use-toast';
import MenuConfigurationManager from './MenuConfigurationManager';

interface MenuItemFormProps {
  itemId?: string;
  parentId?: string;
  onSuccess: (newItem?: any) => void;
  onCancel: () => void;
}

type MenuItemFormData = {
  title: string;
  menu_type: 'url' | 'category';
  url?: string;
  category_id?: string;
  parent_id?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
};

const MenuItemForm = ({ itemId, parentId, onSuccess, onCancel }: MenuItemFormProps) => {
  const [loading, setLoading] = useState(false);
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const { data: categories = [] } = useAdminCategories();
  const { data: menuItems = [] } = useAdminMenuItems();
  const { toast } = useToast();

  const form = useForm<MenuItemFormData>({
    defaultValues: {
      title: '',
      menu_type: 'url',
      url: '',
      category_id: undefined,
      parent_id: parentId || undefined,
      icon: '',
      display_order: 0,
      is_active: true,
    }
  });

  const { handleSubmit, setValue, watch } = form;
  const menuType = watch('menu_type');
  const selectedParentId = watch('parent_id');

  // Função para buscar todos os itens de forma plana (incluindo filhos)
  const flattenMenuItems = (items: MenuItem[]): MenuItem[] => {
    const result: MenuItem[] = [];
    
    const traverse = (itemList: MenuItem[]) => {
      itemList.forEach(item => {
        result.push(item);
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      });
    };
    
    traverse(items);
    return result;
  };

  // Filter out any entries with invalid IDs to prevent Select.Item errors
  const validCategories = categories.filter(category => category.id && category.id.trim() !== '');
  const validMenuItems = flattenMenuItems(menuItems).filter(item => 
    item.id && item.id.trim() !== '' && item.id !== itemId && !item.parent_id // Apenas itens raiz podem ser pais
  );

  const onSubmit = async (data: MenuItemFormData) => {
    setLoading(true);
    try {
      // Limpar campos baseado no tipo
      const cleanData = { ...data };
      
      // Converter "none" de volta para undefined para parent_id
      if (cleanData.parent_id === "none") {
        cleanData.parent_id = undefined;
      }
      
      // Se é um submenu (tem parent_id), deve ter URL ou categoria
      if (cleanData.parent_id) {
        // Submenus devem ter conteúdo
        if (data.menu_type === 'url') {
          cleanData.category_id = undefined;
          // URL é obrigatória para submenus do tipo URL
        } else {
          cleanData.url = undefined;
          // category_id é obrigatória para submenus do tipo categoria
        }
      } else {
        // Itens raiz podem não ter conteúdo (apenas título) ou ter URL/categoria
        if (data.menu_type === 'url') {
          cleanData.category_id = undefined;
        } else {
          cleanData.url = undefined;
        }
      }

      let result;
      if (itemId) {
        await updateMenuItem.mutateAsync({ id: itemId, ...cleanData } as any);
        result = { id: itemId };
        toast({ title: "Sucesso", description: "Item do menu atualizado com sucesso!" });
      } else {
        result = await createMenuItem.mutateAsync(cleanData as any);
        toast({ title: "Item criado com sucesso!", description: "Agora você pode configurar a visibilidade." });
      }
      
      onSuccess(result);
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar item do menu. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isSubmenu = !!selectedParentId && selectedParentId !== "none";

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">
          {itemId ? 'Editar Item do Menu' : (isSubmenu ? 'Novo Submenu' : 'Novo Item do Menu')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Título</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        placeholder="Ex: Início, Contato..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Item Pai (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                          <SelectValue placeholder="Selecione um item pai" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="none">Nenhum (Item Raiz)</SelectItem>
                        {validMenuItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="menu_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="url">URL Personalizada</SelectItem>
                      <SelectItem value="category">Categoria</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {menuType === 'url' && (
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">URL</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        placeholder="Ex: /, /contato, /sobre..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {menuType === 'category' && (
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {validCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isSubmenu && (
              <div className="p-4 border border-dashed border-blue-600 rounded-lg text-center text-blue-200 bg-blue-900/20">
                <p><strong>Submenu:</strong> Este item será exibido como filho do item pai selecionado.</p>
                <p className="text-sm mt-1">Submenus devem ter URL ou categoria definida.</p>
              </div>
            )}

            {!isSubmenu && (
              <div className="p-4 border border-dashed border-green-600 rounded-lg text-center text-green-200 bg-green-900/20">
                <p><strong>Item Raiz:</strong> Este item pode ter filhos (submenus).</p>
                <p className="text-sm mt-1">Itens raiz podem não ter URL nem categoria se tiverem apenas filhos.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Ícone (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        placeholder="Ex: home, menu, user..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Ordem</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        min="0"
                        className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-700 p-3 bg-zinc-800/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-zinc-300">Ativo</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Gerenciar Configurações de Visibilidade */}
            {itemId && (
              <div className="space-y-4 pt-6 border-t border-zinc-700">
                <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
                  Configurações de Visibilidade
                </h3>
                <MenuConfigurationManager itemId={itemId} />
              </div>
            )}

            {!itemId && (
              <div className="p-4 border border-dashed border-zinc-700 rounded-lg text-center text-zinc-400 bg-zinc-900/50">
                <p>Salve o item para poder configurar a visibilidade por cidade e tipo de usuário.</p>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6 border-t border-zinc-700">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : (itemId ? 'Atualizar Item' : 'Criar e Continuar')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MenuItemForm;
