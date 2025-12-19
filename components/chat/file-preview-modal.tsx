// components/chat/file-preview-modal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileText,
  File as FileIcon,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatService } from "@/lib/api/services/chat-service";
import { FileTypeIcon } from "./file-type-icon";
import toast from "react-hot-toast";

interface FilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: Array<{
    id?: number;
    name: string;
    size: number;
    url?: string;
    mimeType?: string;
    thumbnailUrl?: string;
  }>;
  initialIndex?: number;
}

export function FilePreviewModal({ 
  open, 
  onOpenChange, 
  files, 
  initialIndex = 0 
}: FilePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [signedUrls, setSignedUrls] = useState<Record<number, string>>({});
  const [urlFetchErrors, setUrlFetchErrors] = useState<Record<number, boolean>>({});

  const currentFile = files[currentIndex];

  useEffect(() => {
    setCurrentIndex(Math.max(0, Math.min(initialIndex, files.length - 1)));
  }, [initialIndex, files.length]);

  useEffect(() => {
    if (open && currentFile) {
      console.log('Modal opened with file:', {
        id: currentFile.id,
        name: currentFile.name,
        url: currentFile.url,
        thumbnailUrl: currentFile.thumbnailUrl,
        mimeType: currentFile.mimeType
      });

      setZoom(1);
      setRotation(0);
      setIsFullscreen(false);
      setImageLoadError(false);
      setIsLoading(true);
      
      // Always try to fetch signed URL for files with ID
      if (currentFile.id && !signedUrls[currentFile.id] && !urlFetchErrors[currentFile.id]) {
        console.log('Fetching signed URL on mount for:', currentFile.id);
        fetchSignedUrl(currentFile.id);
      } else if (currentFile.url || currentFile.thumbnailUrl) {
        setIsLoading(false);
      }
    }
  }, [open, currentIndex, currentFile]);

  const fetchSignedUrl = async (fileId: number) => {
    try {
      console.log('fetchSignedUrl called for:', fileId);
      setUrlFetchErrors(prev => ({ ...prev, [fileId]: false }));
      
      // Check cache first
      const cached = ChatService.getCachedSignedUrl(fileId);
      if (cached) {
        console.log('Using cached URL for:', fileId, cached);
        setSignedUrls(prev => ({ ...prev, [fileId]: cached }));
        setIsLoading(false);
        return;
      }
      
      const downloadInfo = await ChatService.getFileDownloadUrl(fileId);
      console.log('Fetched signed URL for:', fileId, downloadInfo.url);
      setSignedUrls(prev => ({ ...prev, [fileId]: downloadInfo.url }));
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to get signed URL:', error);
      setUrlFetchErrors(prev => ({ ...prev, [fileId]: true }));
      setIsLoading(false);
      toast.error('Failed to load file URL');
    }
  };

  const getFileUrl = (file: any) => {
    // Prioritize signed URL for preview (has CORS headers)
    if (file.id && signedUrls[file.id]) {
      return signedUrls[file.id];
    }
    
    // Fallback to direct URL (may have CORS issues)
    if (file.url) {
      return file.url;
    }
    
    // Last resort: thumbnail
    if (file.thumbnailUrl) {
      return file.thumbnailUrl;
    }
    
    return '';
  };

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for our handled keys
      if (['Escape', 'ArrowLeft', 'ArrowRight', '+', '=', '-', 'r', 'R', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }

      switch (e.key) {
        case 'Escape':
          onOpenChange(false);
          break;
        case 'ArrowLeft':
          if (files.length > 1) handlePrevious();
          break;
        case 'ArrowRight':
          if (files.length > 1) handleNext();
          break;
        case '+':
        case '=':
          if (currentFile && ChatService.isImage(currentFile.mimeType || '', currentFile.name)) handleZoomIn();
          break;
        case '-':
          if (currentFile && ChatService.isImage(currentFile.mimeType || '', currentFile.name)) handleZoomOut();
          break;
        case 'r':
        case 'R':
          if (currentFile && ChatService.isImage(currentFile.mimeType || '', currentFile.name)) handleRotate();
          break;
        case 'd':
        case 'D':
          handleDownload();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, files.length, currentFile]);

  const handleDownload = async () => {
    if (!currentFile) return;
    
    setIsDownloading(true);
    try {
      if (currentFile.id) {
        await ChatService.downloadFile(currentFile.id, currentFile.name);
        toast.success('Download started');
      } else if (currentFile.url) {
        const link = document.createElement('a');
        link.href = currentFile.url;
        link.download = currentFile.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started');
      } else {
        toast.error('No download URL available');
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download file');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : files.length - 1;
    setCurrentIndex(prevIndex);
  };

  const handleNext = () => {
    const nextIndex = currentIndex < files.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(nextIndex);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.1));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const isImage = currentFile ? ChatService.isImage(currentFile.mimeType || '', currentFile.name) : false;
  const isVideo = currentFile ? ChatService.isVideo(currentFile.mimeType || '', currentFile.name) : false;
  const isAudio = currentFile ? ChatService.isAudio(currentFile.mimeType || '', currentFile.name) : false;
  const isPdf = currentFile ? ChatService.isPdf(currentFile.mimeType || '', currentFile.name) : false;
  const isText = currentFile ? ChatService.isTextFile(currentFile.mimeType || '', currentFile.name) : false;

  const renderPreview = () => {
    if (!currentFile) return null;

    if (isImage && !imageLoadError) {
      return (
        <div className="flex items-center justify-center h-full w-full overflow-auto relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading image...</span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-center min-h-full min-w-full">
            <img
              src={getFileUrl(currentFile)}
              alt={currentFile.name}
              className={cn(
                "max-h-full max-w-full object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
              onError={(e) => {
                console.error('Image load error:', {
                  src: e.currentTarget.src,
                  file: currentFile,
                  signedUrls,
                  hasDirectUrl: !!currentFile.url,
                  hasSignedUrl: !!(currentFile.id && signedUrls[currentFile.id])
                });
                
                // Try to fetch signed URL if we haven't already
                if (currentFile.id && !signedUrls[currentFile.id] && !urlFetchErrors[currentFile.id]) {
                  fetchSignedUrl(currentFile.id);
                } else {
                  setImageLoadError(true);
                  setIsLoading(false);
                  toast.error('Failed to load image');
                }
              }}
              onLoad={() => {
                setImageLoadError(false);
                setIsLoading(false);
              }}
              draggable={false}
            />
          </div>
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="flex items-center justify-center h-full w-full relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading video...</span>
              </div>
            </div>
          )}
          <video
            src={getFileUrl(currentFile)}
            controls
            className="max-h-full max-w-full"
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
            onVolumeChange={(e) => setIsVideoMuted((e.target as HTMLVideoElement).muted)}
            onLoadStart={() => setIsLoading(true)}
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              toast.error('Failed to load video');
            }}
          >
            Your browser does not support video playback.
          </video>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="flex items-center justify-center h-full w-full p-8">
          <div className="bg-gradient-to-br from-muted/50 to-muted rounded-xl p-8 text-center max-w-md w-full shadow-lg">
            <div className="mb-6">
              <div className="h-20 w-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Volume2 className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">{currentFile.name}</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {ChatService.formatFileSize(currentFile.size)}
            </p>
            <audio
              src={getFileUrl(currentFile)}
              controls
              className="w-full"
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <iframe
            src={`${getFileUrl(currentFile)}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
            className="w-full h-full border-0"
            title={currentFile.name}
            onError={() => {
              toast.error('Failed to load PDF. Click download to view it.');
            }}
          />
        </div>
      );
    }

    if (isText && currentFile.size < 1024 * 1024) { // Only preview text files under 1MB
      return <TextFilePreview url={getFileUrl(currentFile)} fileName={currentFile.name} />;
    }

    // Handle image load error
    if (isImage && imageLoadError) {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <div className="bg-gradient-to-br from-destructive/5 to-destructive/10 border border-destructive/20 rounded-xl p-8 text-center max-w-md shadow-lg">
            <div className="mb-6">
              <div className="h-20 w-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">{currentFile.name}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {ChatService.formatFileSize(currentFile.size)}
            </p>
            <p className="text-destructive text-sm mb-6">
              Failed to load image. The file might be corrupted or in an unsupported format.
            </p>
            <Button onClick={handleDownload} disabled={isDownloading} variant="outline">
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isDownloading ? 'Downloading...' : 'Download File'}
            </Button>
          </div>
        </div>
      );
    }

    // Generic file preview
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="bg-gradient-to-br from-muted/50 to-muted rounded-xl p-8 text-center max-w-md shadow-lg">
          <div className="mb-6">
            <div className="h-20 w-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <FileTypeIcon 
                mimeType={currentFile.mimeType} 
                fileName={currentFile.name} 
                className="h-10 w-10 text-primary" 
              />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">{currentFile.name}</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {ChatService.formatFileSize(currentFile.size)}
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            This file type cannot be previewed in the browser. Download to view it on your device.
          </p>
          <Button onClick={handleDownload} disabled={isDownloading} size="lg" className="px-6">
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isDownloading ? 'Downloading...' : 'Download File'}
          </Button>
        </div>
      </div>
    );
  };

  if (!currentFile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!max-w-full w-screen h-screen p-0 overflow-hidden rounded-none"
        onInteractOutside={(e) => e.preventDefault()}
        hideDefaultClose
      >
        <DialogTitle className="sr-only">{currentFile.name}</DialogTitle>
        
        {/* Header */}
        <div className="flex flex-row items-center justify-between p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <FileTypeIcon 
                mimeType={currentFile.mimeType} 
                fileName={currentFile.name} 
                className="h-6 w-6 text-primary flex-shrink-0" 
              />
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-foreground">
                  {currentFile.name}
                </h2>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{ChatService.formatFileSize(currentFile.size)}</span>
                  {currentFile.mimeType && (
                    <span className="px-2 py-1 bg-muted rounded-md text-xs font-medium">
                      {currentFile.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                    </span>
                  )}
                  {files.length > 1 && (
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                      {currentIndex + 1} of {files.length}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Navigation for multiple files */}
            {files.length > 1 && (
              <>
                <Button variant="ghost" size="sm" onClick={handlePrevious} className="h-9 px-3">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button variant="ghost" size="sm" onClick={handleNext} className="h-9 px-3">
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                <div className="w-px h-6 bg-border mx-2" />
              </>
            )}

            {/* Image controls */}
            {isImage && !imageLoadError && (
              <>
                <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 0.1} className="h-9 w-9">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-3 py-1 bg-muted rounded-md min-w-[50px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 5} className="h-9 w-9">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleRotate} className="h-9 w-9">
                  <RotateCw className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-2" />
              </>
            )}

            {/* Fullscreen toggle */}
            <Button variant="ghost" size="icon" onClick={handleFullscreen} className="h-9 w-9">
              <Maximize2 className="h-4 w-4" />
            </Button>

            {/* Download */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload} 
              disabled={isDownloading}
              className="h-9 px-3"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>

            {/* Close */}
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-9 w-9 ml-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div 
          className="flex-1 relative overflow-hidden"
          onWheel={(e) => {
            if (isImage && !imageLoadError) {
              e.preventDefault();
              e.stopPropagation();
              const delta = e.deltaY > 0 ? -0.1 : 0.1;
              setZoom(prev => Math.max(0.1, Math.min(5, prev + delta)));
            }
          }}
        >
          {renderPreview()}
        </div>

        {/* Footer with file info */}
        <div className="border-t p-4 bg-muted/20">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium">Type:</span>
                <span className="px-2 py-1 bg-muted rounded text-xs">
                  {currentFile.mimeType || 'Unknown'}
                </span>
              </div>
              {isImage && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Zoom:</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <kbd className="px-2 py-1 bg-muted rounded font-mono">←→</kbd>
              <span>navigate</span>
              <kbd className="px-2 py-1 bg-muted rounded font-mono">±</kbd>
              <span>zoom</span>
              <kbd className="px-2 py-1 bg-muted rounded font-mono">R</kbd>
              <span>rotate</span>
              <kbd className="px-2 py-1 bg-muted rounded font-mono">D</kbd>
              <span>download</span>
              <kbd className="px-2 py-1 bg-muted rounded font-mono">ESC</kbd>
              <span>close</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Text file preview component
function TextFilePreview({ url, fileName }: { url?: string; fileName: string }) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!url) return;

    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch file');
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError('Failed to load file content');
        console.error('Text preview error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading file content...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-muted rounded-lg p-8 text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 overflow-auto">
      <pre className="text-sm font-mono whitespace-pre-wrap break-words">
        {content}
      </pre>
    </div>
  );
}