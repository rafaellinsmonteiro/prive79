
import { useState } from 'react';
import { useGalleryMedia } from '@/hooks/useGalleryMedia';
import Header from '@/components/Header';
import MediaCard from '@/components/gallery/MediaCard';
import GalleryFilters from '@/components/gallery/GalleryFilters';

const GalleryPage = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'photo' | 'video'>('all');
  const { data: allMedia = [], isLoading, error } = useGalleryMedia(activeFilter);

  // Calcular contadores para os filtros
  const photoCount = allMedia.filter(m => m.media_type === 'photo').length;
  const videoCount = allMedia.filter(m => m.media_type === 'video').length;
  const totalCount = allMedia.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-zinc-100">Carregando galeria...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400">Erro ao carregar galeria: {error.message}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            GALERIA <span className="text-primary">EXCLUSIVA</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Explore nossa coleção de fotos e vídeos das melhores modelos
          </p>
        </div>

        {/* Filtros */}
        <GalleryFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          totalCount={totalCount}
          photoCount={photoCount}
          videoCount={videoCount}
        />

        {/* Grade de mídia */}
        {allMedia.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">Nenhuma mídia encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allMedia.map((media) => (
              <MediaCard key={`${media.media_type}-${media.id}`} media={media} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
