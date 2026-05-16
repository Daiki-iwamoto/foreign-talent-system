"use client";

import { ExternalLink } from "lucide-react";

export function PdfViewer({ candidateId }: { candidateId: string }) {
  const src = `/api/candidates/${candidateId}/pdf`;
  return (
    <div className="border rounded-lg overflow-hidden bg-card flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
        <span className="text-sm font-medium">履歴書PDF</span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          別タブで開く
          <ExternalLink className="size-3" />
        </a>
      </div>
      <iframe
        src={src}
        title="履歴書PDF"
        className="w-full h-[calc(100vh-220px)] min-h-[600px] bg-white"
      />
    </div>
  );
}
