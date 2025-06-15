
import { useState } from 'react';
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useAdminCategories';
import { Category } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CategoryForm } from './CategoryForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash, Plus } from 'lucide-react';

const CategoriesManager = () => {
  const { data: categories = [], isLoading } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...data });
        toast({ title: 'Sucesso', description: 'Categoria atualizada.' });
      } else {
        await createCategory.mutateAsync(data);
        toast({ title: 'Sucesso', description: 'Categoria criada.' });
      }
      setIsFormOpen(false);
      setEditingCategory(null);
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await deleteCategory.mutateAsync(id);
        toast({ title: 'Sucesso', description: 'Categoria excluída.' });
      } catch (error: any) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      }
    }
  };
  
  const openForm = (category: Category | null = null) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Gerenciar Categorias</h3>
        <Button onClick={() => openForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {isFormOpen && (
        <CategoryForm
          category={editingCategory}
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsFormOpen(false); setEditingCategory(null); }}
          isLoading={createCategory.isPending || updateCategory.isPending}
        />
      )}

      {isLoading && <p>Carregando categorias...</p>}
      
      <div className="border border-zinc-800 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800">
              <TableHead className="text-white">Nome</TableHead>
              <TableHead className="text-white">Ordem</TableHead>
              <TableHead className="text-right text-white">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id} className="border-zinc-800">
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.display_order}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openForm(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CategoriesManager;
