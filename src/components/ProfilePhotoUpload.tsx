import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Save, X } from 'lucide-react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import 'react-image-crop/dist/ReactCrop.css';

interface ProfilePhotoUploadProps {
  size?: 'sm' | 'md' | 'lg';
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  size = 'lg'
}) => {
  const { data: currentUser } = useCurrentUser();
  const { uploadProfilePhoto, isUploading, currentPhotoUrl } = useProfilePhoto();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setIsOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(newCrop);
  }, []);

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: Crop): Promise<Blob> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Canvas is empty');
          }
          resolve(blob);
        }, 'image/jpeg', 0.9);
      });
    },
    []
  );

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) {
      toast({
        title: "Erro",
        description: "Selecione uma área da imagem para cortar",
        variant: "destructive"
      });
      return;
    }

    try {
      // Gerar imagem cortada
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      // Upload usando o hook
      const photoUrl = await uploadProfilePhoto(croppedBlob);
      
      if (photoUrl) {
        setIsOpen(false);
        setImageSrc('');
        setCrop(undefined);
        setCompletedCrop(undefined);
      }
    } catch (error) {
      console.error('Error saving photo:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar a imagem",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setImageSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} ring-4 ring-primary/20 transition-all duration-200 group-hover:ring-primary/40`}>
          <AvatarImage 
            src={currentPhotoUrl || '/lovable-uploads/182f2a41-9665-421f-ad03-aee8b5a34ad0.png'} 
            alt="Foto de perfil"
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-2xl">
            {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay de câmera no hover */}
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
             onClick={() => hiddenFileInput.current?.click()}>
          <Camera className="w-6 h-6 text-white" />
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => hiddenFileInput.current?.click()}
        className="border-border bg-background text-foreground hover:bg-accent"
      >
        <Upload className="w-4 h-4 mr-2" />
        Alterar Foto
      </Button>

      {/* Input de arquivo oculto */}
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={onSelectFile}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Dialog para edição da imagem */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Foto de Perfil</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {imageSrc && (
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  minWidth={100}
                  minHeight={100}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    alt="Crop preview"
                    src={imageSrc}
                    style={{ maxHeight: '400px', maxWidth: '100%' }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!completedCrop || isUploading}
                className="bg-primary hover:bg-primary/90"
              >
                {isUploading ? (
                  <>Salvando...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePhotoUpload;