
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image, Video, Mic, File, X } from 'lucide-react';

interface MediaUploadProps {
  onUpload: (mediaData: {
    url: string;
    type: string;
    fileName?: string;
    fileSize?: number;
  }) => void;
  onCancel: () => void;
}

const MediaUpload = ({ onUpload, onCancel }: MediaUploadProps) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    // Create a URL for the file (in a real app, you'd upload to storage)
    const url = URL.createObjectURL(file);
    
    onUpload({
      url: url,
      type: file.type,
      fileName: file.name,
      fileSize: file.size,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <Card className="bg-zinc-800 border-zinc-700 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">Enviar Mídia</h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-zinc-600 hover:border-zinc-500'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <p className="text-zinc-400 mb-4">
            Arraste arquivos aqui ou clique nos botões abaixo
          </p>

          {/* Upload Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="outline" className="w-full" asChild>
                <span className="cursor-pointer">
                  <Image className="h-4 w-4 mr-2" />
                  Imagem
                </span>
              </Button>
            </label>

            <Input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload">
              <Button variant="outline" className="w-full" asChild>
                <span className="cursor-pointer">
                  <Video className="h-4 w-4 mr-2" />
                  Vídeo
                </span>
              </Button>
            </label>

            <Input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
              id="audio-upload"
            />
            <label htmlFor="audio-upload">
              <Button variant="outline" className="w-full" asChild>
                <span className="cursor-pointer">
                  <Mic className="h-4 w-4 mr-2" />
                  Áudio
                </span>
              </Button>
            </label>

            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="w-full" asChild>
                <span className="cursor-pointer">
                  <File className="h-4 w-4 mr-2" />
                  Arquivo
                </span>
              </Button>
            </label>
          </div>

          <p className="text-xs text-zinc-500 mt-4">
            Tamanho máximo: 10MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaUpload;
