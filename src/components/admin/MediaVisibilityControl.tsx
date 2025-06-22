
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import VisibilityControl from './VisibilityControl';
import { useUpdatePhotoVisibilitySettings, useUpdateVideoVisibilitySettings } from '@/hooks/useMediaMutations';
import { toast } from 'sonner';

interface MediaVisibilityControlProps {
  mediaId: string;
  mediaType: 'photo' | 'video';
  currentVisibilityType?: string;
  currentAllowedPlanIds?: string[];
  modelId: string;
}

const MediaVisibilityControl = ({ 
  mediaId, 
  mediaType, 
  currentVisibilityType = 'public',
  currentAllowedPlanIds = [],
  modelId
}: MediaVisibilityControlProps) => {
  const [open, setOpen] = useState(false);
  const updatePhotoVisibility = useUpdatePhotoVisibilitySettings();
  const updateVideoVisibility = useUpdateVideoVisibilitySettings();

  const handleVisibilityChange = async (type: string, planIds: string[]) => {
    try {
      if (mediaType === 'photo') {
        await updatePhotoVisibility.mutateAsync({
          photoId: mediaId,
          visibilityType: type,
          allowedPlanIds: planIds,
        });
      } else {
        await updateVideoVisibility.mutateAsync({
          videoId: mediaId,
          visibilityType: type,
          allowedPlanIds: planIds,
        });
      }
      
      toast.success('Visibilidade atualizada com sucesso!');
      setOpen(false);
    } catch (error) {
      toast.error('Erro ao atualizar visibilidade');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            Controle de Visibilidade - {mediaType === 'photo' ? 'Foto' : 'Vídeo'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <VisibilityControl
            visibilityType={currentVisibilityType}
            allowedPlanIds={currentAllowedPlanIds}
            onVisibilityChange={handleVisibilityChange}
            label="Visibilidade desta mídia"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaVisibilityControl;
