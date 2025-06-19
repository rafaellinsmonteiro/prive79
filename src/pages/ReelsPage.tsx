
import { useModels } from "@/hooks/useModels";
import { useCity } from "@/contexts/CityContext";
import Header from "@/components/Header";
import ReelsFeed from "@/components/reels/ReelsFeed";

const ReelsPage = () => {
  const { selectedCityId } = useCity();
  const { data: models = [], isLoading, error } = useModels(selectedCityId);

  // Filtrar apenas modelos que têm vídeos
  const modelsWithVideos = models.filter(model => 
    model.id // Para agora, vamos usar todos os modelos - depois podemos filtrar por vídeos reais
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400">Erro ao carregar: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <ReelsFeed models={modelsWithVideos} />
    </div>
  );
};

export default ReelsPage;
