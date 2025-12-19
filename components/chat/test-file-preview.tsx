// components/chat/test-file-preview.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FilePreviewModal } from "./file-preview-modal";

const sampleFiles = [
  {
    id: 1,
    name: "sample-image.jpg",
    size: 1024000,
    url: "https://picsum.photos/800/600",
    mimeType: "image/jpeg",
    thumbnailUrl: "https://picsum.photos/200/150"
  },
  {
    id: 2,
    name: "sample-document.pdf",
    size: 2048000,
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    mimeType: "application/pdf"
  },
  {
    id: 3,
    name: "sample-video.mp4",
    size: 5120000,
    url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    mimeType: "video/mp4"
  }
];

export function TestFilePreview() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handlePreview = (index: number) => {
    setSelectedIndex(index);
    setPreviewOpen(true);
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Test File Preview</h3>
      
      <div className="grid gap-2">
        {sampleFiles.map((file, index) => (
          <div key={file.id} className="flex items-center gap-3 p-3 border rounded">
            <div className="flex-1">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{file.mimeType}</p>
            </div>
            <Button onClick={() => handlePreview(index)}>
              Preview
            </Button>
          </div>
        ))}
      </div>

      <FilePreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        files={sampleFiles}
        initialIndex={selectedIndex}
      />
    </div>
  );
}