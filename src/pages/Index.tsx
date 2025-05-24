
import { useState } from "react";
import ModelCard from "@/components/ModelCard";
import ModelProfile from "@/components/ModelProfile";
import { useModels, Model } from "@/hooks/useModels";

const Index = () => {
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const { data: models = [], isLoading, error } = useModels();

  const handleModelClick = (model: Model) => {
    setSelectedModel(model);
  };

  const handleCloseProfile = () => {
    setSelectedModel(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Carregando modelos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Erro ao carregar modelos</p>
          <p className="text-zinc-400 mt-2">Tente recarregar a página</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
          </header>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {models.map((model) => (
              <ModelCard
                key={model.id}
                name={model.name}
                age={model.age}
                image={model.photos.find(photo => photo.is_primary)?.photo_url || model.photos[0]?.photo_url || ''}
                whatsappNumber={model.whatsapp_number}
                onClick={() => handleModelClick(model)}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedModel && (
        <ModelProfile
          model={selectedModel}
          onClose={handleCloseProfile}
        />
      )}
    </>
  );
};

export default Index;
