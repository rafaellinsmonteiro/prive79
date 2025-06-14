import { useState } from "react";
import ModelCard from "@/components/ModelCard";
import ModelProfile from "@/components/ModelProfile";
import Header from "@/components/Header";
import { useModels } from "@/hooks/useModels";

const Index = () => {
  const [selectedModel, setSelectedModel] = useState(null);
  const { data: models = [], isLoading, error } = useModels();

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      
      {selectedModel ? (
        <ModelProfile 
          model={selectedModel} 
          onClose={() => setSelectedModel(null)} 
        />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Acompanhantes de <span className="text-primary">Luxo</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Encontre as melhores acompanhantes da sua cidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {models.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onClick={() => setSelectedModel(model)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
