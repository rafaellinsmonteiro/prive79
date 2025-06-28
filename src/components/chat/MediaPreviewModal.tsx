
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  fileName?: string;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  isOpen,
  onClose,
  mediaUrl,
  mediaType,
  fileName
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = fileName || `media_${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] bg-zinc-900 border-zinc-800 p-0">
        <DialogHeader className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white">
              {mediaType === 'photo' ? 'Foto' : 'Vídeo'}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="text-white hover:bg-zinc-800"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex items-center justify-center p-4 bg-black">
          {mediaType === 'photo' ? (
            <img
              src={mediaUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              className="max-w-full max-h-full"
              autoPlay
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPreviewModal;
