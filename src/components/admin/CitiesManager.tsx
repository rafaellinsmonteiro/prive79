
import { useState } from 'react';
import { useAdminCities, useCreateCity, useUpdateCity, useDeleteCity } from '@/hooks/useAdminCities';
import { City } from '@/hooks/useCities';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CityForm } from './CityForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash, Plus, CheckCircle, XCircle } from 'lucide-react';

const CitiesManager = () => {
  const { data: cities = [], isLoading } = useAdminCities();
  const createCity = useCreateCity();
  const updateCity = useUpdateCity();
  const deleteCity = useDeleteCity();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingCity) {
        await updateCity.mutateAsync({ id: editingCity.id, ...data });
        toast({ title: 'Sucesso', description: 'Cidade atualizada.' });
      } else {
        await createCity.mutateAsync(data);
        toast({ title: 'Sucesso', description: 'Cidade criada.' });
      }
      setIsFormOpen(false);
      setEditingCity(null);
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta cidade?')) {
      try {
        await deleteCity.mutateAsync(id);
        toast({ title: 'Sucesso', description: 'Cidade excluída.' });
      } catch (error: any) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      }
    }
  };
  
  const openForm = (city: City | null = null) => {
    setEditingCity(city);
    setIsFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Gerenciar Cidades</h3>
        <Button onClick={() => openForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Cidade
        </Button>
      </div>

      {isFormOpen && (
        <CityForm
          city={editingCity}
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsFormOpen(false); setEditingCity(null); }}
          isLoading={createCity.isPending || updateCity.isPending}
        />
      )}

      {isLoading && <p>Carregando cidades...</p>}
      
      <div className="border border-zinc-800 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800">
              <TableHead className="text-white">Nome</TableHead>
              <TableHead className="text-white">UF</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-right text-white">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cities.map((city) => (
              <TableRow key={city.id} className="border-zinc-800">
                <TableCell>{city.name}</TableCell>
                <TableCell>{city.state}</TableCell>
                <TableCell>
                  {city.is_active 
                    ? <CheckCircle className="h-5 w-5 text-green-500" />
                    : <XCircle className="h-5 w-5 text-red-500" />
                  }
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openForm(city)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(city.id)}>
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

export default CitiesManager;
