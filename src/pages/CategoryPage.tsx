
import { useParams, Navigate } from "react-router-dom";
import { useModels } from "@/hooks/useModels";
import { useCategories } from "@/hooks/useCategories";
import { useCity } from "@/contexts/CityContext";
import ModelCard from "@/components/ModelCard";
import Header from "@/components/Header";

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { selectedCityId } = useCity();
  const { data: categories = [] } = useCategories();
  
  if (!categoryId) {
    return <Navigate to="/" replace />;
  }

  const category = categories.find(c => c.id === categoryId);
  const { data: allModels = [], isLoading, error } = useModels(selectedCityId);
  
  // Filter models by category
  const models = allModels.filter(model => 
    model.categories?.some(cat => cat.id === categoryId)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-red-400">Erro ao carregar dados: {error.message}</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-red-400">Categoria não encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {category.name}
          </h1>
          <p className="text-zinc-400 text-lg">
            {models.length} modelo{models.length !== 1 ? 's' : ''} encontrado{models.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {models.map(model => (
            <ModelCard 
              key={model.id} 
              model={model}
            />
          ))}
        </div>

        {models.length === 0 && (
          <div className="text-center text-zinc-400 mt-16">
            <p>Nenhum modelo encontrado para esta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
