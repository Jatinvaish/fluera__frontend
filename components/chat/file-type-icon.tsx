// components/chat/file-type-icon.tsx
"use client";

import React from "react";
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileArchive, 
  FileSpreadsheet,
  FileCode,
  File as FileIcon
} from "lucide-react";
import { ChatService } from "@/lib/api/services/chat-service";

interface FileTypeIconProps {
  mimeType?: string;
  fileName?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function FileTypeIcon({ 
  mimeType = '', 
  fileName = '', 
  className = '',
  size = "md"
}: FileTypeIconProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6",
    xl: "h-8 w-8"
  };

  const iconClass = `${sizeClasses[size]} ${className}`;

  // Images
  if (ChatService.isImage(mimeType, fileName)) {
    return <ImageIcon className={iconClass} />;
  }

  // Videos
  if (ChatService.isVideo(mimeType, fileName)) {
    return <Video className={iconClass} />;
  }

  // Audio
  if (ChatService.isAudio(mimeType, fileName)) {
    return <Music className={iconClass} />;
  }

  // PDFs
  if (ChatService.isPdf(mimeType, fileName)) {
    return <FileText className={iconClass} />;
  }

  // Text files and code
  if (ChatService.isTextFile(mimeType, fileName)) {
    // Check if it's a code file
    if (fileName.match(/\.(js|ts|jsx|tsx|css|html|htm|json|xml|yaml|yml|py|java|cpp|c|h|php|rb|go|rs|swift|kt)$/i)) {
      return <FileCode className={iconClass} />;
    }
    return <FileText className={iconClass} />;
  }

  // Spreadsheets
  if (mimeType.includes('excel') || 
      mimeType.includes('spreadsheet') || 
      fileName.match(/\.(xls|xlsx|csv)$/i)) {
    return <FileSpreadsheet className={iconClass} />;
  }

  // Presentations
  if (mimeType.includes('powerpoint') || 
      mimeType.includes('presentation') || 
      fileName.match(/\.(ppt|pptx)$/i)) {
    return <FileSpreadsheet className={iconClass} />;
  }

  // Archives
  if (mimeType.includes('zip') || 
      mimeType.includes('rar') || 
      mimeType.includes('archive') ||
      fileName.match(/\.(zip|rar|7z|tar|gz)$/i)) {
    return <FileArchive className={iconClass} />;
  }

  // Documents
  if (mimeType.includes('word') || 
      mimeType.includes('document') || 
      fileName.match(/\.(doc|docx|rtf)$/i)) {
    return <FileText className={iconClass} />;
  }

  // Default file icon
  return <FileIcon className={iconClass} />;
}