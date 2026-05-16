"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function PdfDropzone({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFiles(accepted);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/40",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <FileUp className="mx-auto size-10 text-muted-foreground mb-3" />
      {isDragActive ? (
        <p className="font-medium">ここにドロップしてください</p>
      ) : (
        <>
          <p className="font-medium">PDFファイルをドラッグ&ドロップ</p>
          <p className="text-sm text-muted-foreground mt-1">またはクリックしてファイルを選択(複数可)</p>
        </>
      )}
    </div>
  );
}
