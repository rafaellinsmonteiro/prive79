import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';
import { useModels } from '@/hooks/useModels';
import ModelCard from '@/components/ModelCard';
import { Category } from '@/hooks/useCategories';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const { data: models = [], isLoading, error } = useModels({
    categoryId: categoryId || null,
  });

  const [ageRange, setAgeRange] = useState<number[]>([18, 30]);
  const [cityFilter, setCityFilter] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const modelsPerPage = 20;

  const currentCategory = categories.find(cat => cat.id === categoryId);

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      // If no categoryId is in the URL, but we have categories loaded,
      // redirect to the first category.
      navigate(`/category/${categories[0].id}`);
    }
  }, [categoryId, categories, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Erro ao carregar modelos.
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Categoria não encontrada.
      </div>
    );
  }

  const handleModelClick = (modelId: string) => {
    navigate(`/model/${modelId}`);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header Section */}
      <div className="bg-zinc-900 py-6 border-b border-zinc-700">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white">{currentCategory.name}</h1>
          <p className="text-zinc-400 mt-2">
            Encontre os melhores modelos em {currentCategory.name}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Age Filter */}
          <div>
            <Label className="text-white">Filtrar por idade:</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                value={ageRange[0]}
                onChange={(e) => setAgeRange([Number(e.target.value), ageRange[1]])}
                className="w-20 bg-zinc-800 border-zinc-700 text-white"
              />
              -
              <Input
                type="number"
                value={ageRange[1]}
                onChange={(e) => setAgeRange([ageRange[0], Number(e.target.value)])}
                className="w-20 bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <Slider
              defaultValue={ageRange}
              max={60}
              step={1}
              onValueChange={setAgeRange}
              className="mt-2"
            />
          </div>

          {/* City Filter */}
          <div>
            <Label className="text-white">Filtrar por cidade:</Label>
            <Select onValueChange={setCityFilter}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-2">
                <SelectValue placeholder="Todas as cidades" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                <SelectItem value={undefined}>Todas as cidades</SelectItem>
                <SelectItem value="aracaju">Aracaju</SelectItem>
                <SelectItem value="salvador">Salvador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div>
            <Label className="text-white">Ordenar por:</Label>
            <Select onValueChange={setSortOrder}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-2">
                <SelectValue placeholder="Nome" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="age">Idade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {models.map((model) => (
            <ModelCard 
              key={model.id} 
              model={model}
            />
          ))}
        </div>

        {/* Empty State */}
        {models.length === 0 && (
          <Card className="bg-zinc-900 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white">Nenhum modelo encontrado</CardTitle>
              <CardDescription className="text-zinc-500">
                Não há modelos disponíveis nesta categoria com os filtros selecionados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">
                Tente ajustar os filtros ou explore outras categorias.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {models.length > modelsPerPage && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-zinc-800 text-white hover:bg-zinc-700 mr-2"
            >
              Anterior
            </Button>
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={models.length <= currentPage * modelsPerPage}
              className="bg-zinc-800 text-white hover:bg-zinc-700"
            >
              Próximo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
