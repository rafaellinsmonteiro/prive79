
import { useModels } from "@/hooks/useModels";
import { useReelsSettings } from "@/hooks/useReelsSettings";
import { useReelsVideos } from "@/hooks/useReelsMedia";
import { useCity } from "@/contexts/CityContext";
import ReelsFeed from "@/components/reels/ReelsFeed";

const ReelsPage = () => {
  const { selectedCityId } = useCity();
  const { data: models = [], isLoading: modelsLoading, error: modelsError } = useModels(selectedCityId);
  const { data: reelsVideos = [], isLoading: videosLoading, error: videosError } = useReelsVideos(selectedCityId);
  const { data: reelsSettings } = useReelsSettings();

  const isLoading = modelsLoading || videosLoading;
  const error = modelsError || videosError;

  // Verificar se o módulo de reels está habilitado - apenas se as configurações forem carregadas e explicitamente desabilitadas
  if (reelsSettings && reelsSettings.is_enabled === false) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Reels Indisponível</h2>
          <p className="text-zinc-400">O módulo de reels está temporariamente desabilitado.</p>
        </div>
      </div>
    );
  }

  // Filtrar apenas modelos que têm vídeos
  const modelsWithReelsVideos = models.filter(model => 
    reelsVideos.some(video => video.model_id === model.id)
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
      <ReelsFeed 
        models={modelsWithReelsVideos} 
        settings={reelsSettings}
      />
    </div>
  );
};

export default ReelsPage;
