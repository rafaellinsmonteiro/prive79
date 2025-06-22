
import { useModels } from "@/hooks/useModels";
import { useCity } from "@/contexts/CityContext";
import ModelCard from "@/components/ModelCard";
import Header from "@/components/Header";

const Index = () => {
  const { selectedCityId } = useCity();
  const {
    data: models = [],
    isLoading,
    error
  } = useModels(selectedCityId);

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Carregando...</div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-red-400">Erro ao carregar dados: {error.message}</div>
      </div>;
  }
  return <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
           A VITRINE MAIS EXCLUSIVA DE <span className="text-primary">ARACAJU</span>
          </h1>
          <p className="text-zinc-400 text-lg">Descubra uma nova forma de conexão e entretenimento de alto nível.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {models.map(model => (
            <ModelCard 
              key={model.id} 
              model={model} 
              
            />
          ))}
        </div>
      </div>
    </div>;
};

export default Index;
