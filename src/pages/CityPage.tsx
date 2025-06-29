import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useModels } from "@/hooks/useModels";
import { useCities } from "@/hooks/useCities";
import { useCity } from "@/contexts/CityContext";
import ModelCard from "@/components/ModelCard";
import Header from "@/components/Header";

const CityPage = () => {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const { data: cities = [] } = useCities();
  const { setSelectedCity } = useCity();
  
  if (!cityId) {
    return <Navigate to="/" replace />;
  }

  const currentCity = cities.find(city => city.id === cityId);
  const { data: models = [], isLoading, error } = useModels({
    cityId: cityId || null,
  });

  useEffect(() => {
    if (currentCity) {
      const cityName = `${currentCity.name} - ${currentCity.state}`;
      setSelectedCity(currentCity.id, cityName);
    }
  }, [currentCity, setSelectedCity]);

  const handleModelClick = (modelId: string) => {
    navigate(`/model/${modelId}`);
  };

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

  if (!currentCity) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-red-400">Cidade não encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {currentCity.name} - {currentCity.state}
          </h1>
          <p className="text-zinc-400 text-lg">
            {models.length} modelo{models.length !== 1 ? 's' : ''} disponível{models.length !== 1 ? 'is' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {models.map((model) => (
            <ModelCard 
              key={model.id} 
              model={model}
            />
          ))}
        </div>

        {models.length === 0 && (
          <div className="text-center text-zinc-400 mt-16">
            <p>Nenhum modelo encontrado para esta cidade.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityPage;
