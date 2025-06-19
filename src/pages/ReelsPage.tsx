
import { useModels } from "@/hooks/useModels";
import { useReelsSettings } from "@/hooks/useReelsSettings";
import { useCity } from "@/contexts/CityContext";
import Header from "@/components/Header";
import ReelsFeed from "@/components/reels/ReelsFeed";

const ReelsPage = () => {
  const { selectedCityId } = useCity();
  const { data: models = [], isLoading, error } = useModels(selectedCityId);
  const { data: reelsSettings } = useReelsSettings();

  // Verificar se o módulo de reels está habilitado
  if (reelsSettings && !reelsSettings.is_enabled) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Reels Indisponível</h2>
          <p className="text-zinc-400">O módulo de reels está temporariamente desabilitado.</p>
        </div>
      </div>
    );
  }

  // Filtrar apenas modelos que têm vídeos featured nos reels
  const modelsWithReelsVideos = models.filter(model => 
    model.id // Para agora, vamos usar todos os modelos - depois podemos filtrar por vídeos reais featured
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
      <ReelsFeed 
        models={modelsWithReelsVideos} 
        settings={reelsSettings}
      />
    </div>
  );
};

export default ReelsPage;
