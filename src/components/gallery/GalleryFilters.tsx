
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Video, Grid } from 'lucide-react';

interface GalleryFiltersProps {
  activeFilter: 'all' | 'photo' | 'video';
  onFilterChange: (filter: 'all' | 'photo' | 'video') => void;
  totalCount: number;
  photoCount: number;
  videoCount: number;
}

const GalleryFilters = ({ 
  activeFilter, 
  onFilterChange, 
  totalCount, 
  photoCount, 
  videoCount 
}: GalleryFiltersProps) => {
  return (
    <Card className="bg-zinc-900 border-zinc-800 mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => onFilterChange('all')}
            className="flex items-center gap-2"
          >
            <Grid className="h-4 w-4" />
            Todos ({totalCount})
          </Button>
          
          <Button
            variant={activeFilter === 'photo' ? 'default' : 'outline'}
            onClick={() => onFilterChange('photo')}
            className="flex items-center gap-2"
          >
            <Image className="h-4 w-4" />
            Fotos ({photoCount})
          </Button>
          
          <Button
            variant={activeFilter === 'video' ? 'default' : 'outline'}
            onClick={() => onFilterChange('video')}
            className="flex items-center gap-2"
          >
            <Video className="h-4 w-4" />
            Vídeos ({videoCount})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GalleryFilters;
