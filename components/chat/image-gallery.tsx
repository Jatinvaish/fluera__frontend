// components/chat/image-gallery.tsx
"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FilePreviewModal } from "./file-preview-modal";
import { ChatService } from "@/lib/api/services/chat-service";
import { Play, Eye } from "lucide-react";

interface ImageGalleryProps {
  files: Array<{
    id?: number;
    name: string;
    size: number;
    url?: string;
    mimeType?: string;
    thumbnailUrl?: string;
  }>;
  className?: string;
}

export function ImageGallery({ files, className }: ImageGalleryProps) {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFileIndex, setPreviewFileIndex] = useState(0);

  // Filter for media files (images and videos)
  const mediaFiles = files.filter(file => 
    ChatService.isImage(file.mimeType || '', file.name) || 
    ChatService.isVideo(file.mimeType || '', file.name)
  );

  if (mediaFiles.length === 0) return null;

  const handleImageClick = (index: number) => {
    setPreviewFileIndex(index);
    setPreviewModalOpen(true);
  };

  const ThumbnailImage = ({ file, index }: { file: any; index: number }) => {
    const isImage = ChatService.isImage(file.mimeType || '', file.name);
    const isVideo = ChatService.isVideo(file.mimeType || '', file.name);
    const [signedUrl, setSignedUrl] = useState<string>('');

    useEffect(() => {
      if (isImage && file.id && !file.url && !file.thumbnailUrl && !signedUrl) {
        const cached = ChatService.getCachedSignedUrl(file.id);
        if (cached) {
          setSignedUrl(cached);
        } else {
          ChatService.getFileDownloadUrl(file.id)
            .then(result => setSignedUrl(result.url))
            .catch(err => console.error('Failed to get signed URL:', err));
        }
      }
    }, [file.id, isImage]);

    const getImageUrl = () => {
      if (signedUrl) return signedUrl;
      if (file.thumbnailUrl) return file.thumbnailUrl;
      if (file.url) return file.url;
      return '';
    };

    return (
      <div
        className="relative group cursor-pointer overflow-hidden rounded-lg bg-muted aspect-square"
        onClick={() => handleImageClick(index)}
      >
        {isImage && (
          <img
            src={getImageUrl()}
            alt={file.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        )}
        
        {isVideo && (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            {file.thumbnailUrl || file.url ? (
              <img
                src={file.thumbnailUrl || file.url}
                alt={file.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <Play className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Eye className="h-5 w-5 text-white" />
        </div>

        {/* File type indicator */}
        {isVideo && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
            Video
          </div>
        )}
      </div>
    );
  };

  const renderThumbnail = (file: any, index: number) => {
    return (
      <ThumbnailImage 
        key={file.id || `${file.name}-${index}`} 
        file={file} 
        index={index} 
      />
    );
  };

  return (
    <>
      <div className={cn("grid gap-2", className)}>
        {mediaFiles.length === 1 && (
          <div className="max-w-sm">
            <ThumbnailImage file={mediaFiles[0]} index={0} />
          </div>
        )}
        
        {mediaFiles.length === 2 && (
          <div className="grid grid-cols-2 gap-2 max-w-md">
            {mediaFiles.map((file, index) => (
              <ThumbnailImage key={file.id || `${file.name}-${index}`} file={file} index={index} />
            ))}
          </div>
        )}
        
        {mediaFiles.length === 3 && (
          <div className="grid grid-cols-2 gap-2 max-w-md">
            <div className="row-span-2">
              <ThumbnailImage file={mediaFiles[0]} index={0} />
            </div>
            <div className="grid gap-2">
              <ThumbnailImage file={mediaFiles[1]} index={1} />
              <ThumbnailImage file={mediaFiles[2]} index={2} />
            </div>
          </div>
        )}
        
        {mediaFiles.length === 4 && (
          <div className="grid grid-cols-2 gap-2 max-w-md">
            {mediaFiles.map((file, index) => (
              <ThumbnailImage key={file.id || `${file.name}-${index}`} file={file} index={index} />
            ))}
          </div>
        )}
        
        {mediaFiles.length > 4 && (
          <div className="grid grid-cols-2 gap-2 max-w-md">
            {mediaFiles.slice(0, 3).map((file, index) => (
              <ThumbnailImage key={file.id || `${file.name}-${index}`} file={file} index={index} />
            ))}
            <div
              className="relative group cursor-pointer overflow-hidden rounded-lg bg-muted aspect-square flex items-center justify-center"
              onClick={() => handleImageClick(3)}
            >
              <img
                src={mediaFiles[3].thumbnailUrl || mediaFiles[3].url}
                alt={mediaFiles[3].name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  +{mediaFiles.length - 3}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <FilePreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        files={files} // Pass all files, not just media files
        initialIndex={previewFileIndex}
      />
    </>
  );
}