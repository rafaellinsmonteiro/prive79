
import { useState } from 'react';
import { useAdminModels } from '@/hooks/useAdminModels';
import MediaManager from './MediaManager';

const MediaManagerContainer = () => {
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const { data: models = [] } = useAdminModels();

  // Get the first model if none selected
  const modelId = selectedModelId || (models.length > 0 ? models[0].id : '');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestão de Mídia</h2>
        <select
          value={selectedModelId}
          onChange={(e) => setSelectedModelId(e.target.value)}
          className="bg-zinc-800 text-white px-4 py-2 rounded border border-zinc-700"
        >
          <option value="">Selecione uma modelo</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      {modelId && <MediaManager modelId={modelId} />}
    </div>
  );
};

export default MediaManagerContainer;
