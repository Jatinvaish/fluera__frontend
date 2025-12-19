// components/chat/simple-file-preview.tsx
"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Eye, Loader2, AlertCircle } from "lucide-react";
import { ChatService } from "@/lib/api/services/chat-service";
import { FileTypeIcon } from "./file-type-icon";
import toast from "react-hot-toast";

interface SimpleFilePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: {
    id?: number;
    name: string;
    size: number;
    url?: string;
    mimeType?: string;
    thumbnailUrl?: string;
  };
}

export function SimpleFilePreview({ open, onOpenChange, file }: SimpleFilePreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (file.id) {
        await ChatService.downloadFile(file.id, file.name);
        toast.success('Download started');
      } else if (file.url) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
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

  const isImage = file.mimeType?.startsWith('image/');
  const isVideo = file.mimeType?.startsWith('video/');
  const isPdf = file.mimeType?.includes('pdf');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <FileTypeIcon
                mimeType={file.mimeType}
                fileName={file.name}
                className="h-6 w-6 text-primary flex-shrink-0"
              />
              <div className="min-w-0">
                <DialogTitle className="text-lg font-semibold text-foreground truncate">
                  {file.name}
                </DialogTitle>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{ChatService.formatFileSize(file.size)}</span>
                  {file.mimeType && (
                    <span className="px-2 py-1 bg-muted rounded-md text-xs font-medium">
                      {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
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
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-9 w-9">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto relative">
          {isImage && (
            <div className="flex justify-center items-center h-full p-6">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Loading image...</span>
                  </div>
                </div>
              )}
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-full object-contain"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                  toast.error('Failed to load image');
                }}
              />
            </div>
          )}

          {isVideo && (
            <div className="flex justify-center items-center h-full p-6">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Loading video...</span>
                  </div>
                </div>
              )}
              <video
                src={file.url}
                controls
                className="max-w-full max-h-full"
                onLoadStart={() => setIsLoading(true)}
                onLoadedData={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                  toast.error('Failed to load video');
                }}
              >
                Your browser does not support video playback.
              </video>
            </div>
          )}

          {isPdf && (
            <iframe
              src={file.url}
              className="w-full h-full border-0"
              title={file.name}
              onError={() => {
                toast.error('Failed to load PDF. Click download to view it.');
              }}
            />
          )}

          {(!isImage && !isVideo && !isPdf) || hasError ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="bg-gradient-to-br from-muted/50 to-muted rounded-xl p-8 text-center max-w-md shadow-lg">
                <div className="mb-6">
                  <div className="h-20 w-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    {hasError ? (
                      <AlertCircle className="h-10 w-10 text-destructive" />
                    ) : (
                      <FileTypeIcon
                        mimeType={file.mimeType}
                        fileName={file.name}
                        className="h-10 w-10 text-primary"
                      />
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{file.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {ChatService.formatFileSize(file.size)}
                </p>
                <p className="text-muted-foreground text-sm mb-6">
                  {hasError
                    ? 'Failed to load file preview. Download to view it on your device.'
                    : 'This file type cannot be previewed in the browser. Download to view it on your device.'
                  }
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
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}