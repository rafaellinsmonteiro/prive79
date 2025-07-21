
import { useParams, Navigate } from "react-router-dom";
import { useModel } from "@/hooks/useModels";
import ModelProfile from "@/components/ModelProfile";

const ModelPage = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/" replace />;
  }

  const { data: model, isLoading, error } = useModel(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Carregando...</div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-red-400">Modelo não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <ModelProfile model={model} />
    </div>
  );
};

export default ModelPage;
