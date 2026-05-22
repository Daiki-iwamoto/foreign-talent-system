"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PdfDropzone } from "@/components/candidates/pdf-dropzone";
import { CandidateFormFields } from "@/components/candidates/candidate-form";
import { candidateFormSchema, type CandidateFormValues } from "@/lib/schemas";

type ItemStatus = "extracting" | "ready" | "saving" | "saved" | "error";

type Item = {
  id: string;
  file: File;
  status: ItemStatus;
  errorMessage?: string;
  ocrRawText?: string;
};

export function UploadFlow() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);

  async function handleFiles(files: File[]) {
    const newItems: Item[] = files.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      status: "extracting",
    }));
    setItems((prev) => [...prev, ...newItems]);

    for (const item of newItems) {
      await extract(item);
    }
  }

  async function extract(item: Item) {
    try {
      const fd = new FormData();
      fd.append("file", item.file);
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "抽出に失敗しました");

      setItems((prev) =>
        prev.map((p) =>
          p.id === item.id
            ? {
                ...p,
                status: "ready",
                ocrRawText: json.extracted.raw_text ?? "",
                extracted: json.extracted,
              } as Item & { extracted: Record<string, string> }
            : p
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "抽出に失敗しました";
      setItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: "error", errorMessage: message } : p))
      );
      toast.error(`${item.file.name}: ${message}`);
    }
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      <PdfDropzone onFiles={handleFiles} />

      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onRemove={() => remove(item.id)}
              onSaved={() => {
                setItems((prev) => prev.filter((p) => p.id !== item.id));
                router.refresh();
              }}
            />
          ))}
        </div>
      )}

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground text-center pt-8">
          ファイルをドロップすると、自動で抽出が始まります
        </p>
      )}
    </div>
  );
}

function ItemCard({
  item,
  onRemove,
  onSaved,
}: {
  item: Item & { extracted?: Record<string, string> };
  onRemove: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    values: item.extracted
      ? {
          full_name: item.extracted.full_name ?? "",
          nationality: item.extracted.nationality ?? "",
          date_of_birth: item.extracted.date_of_birth ?? "",
          gender: item.extracted.gender ?? "",
          email: item.extracted.email ?? "",
          phone: item.extracted.phone ?? "",
          industry: item.extracted.industry ?? "",
          company_name: "",
          job_title: item.extracted.job_title ?? "",
          work_history: item.extracted.work_history ?? "",
          education: item.extracted.education ?? "",
          memo: "",
        }
      : undefined,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", item.file);
      fd.append(
        "payload",
        JSON.stringify({ ...values, ocr_raw_text: item.ocrRawText ?? "" })
      );
      const res = await fetch("/api/candidates", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "登録に失敗しました");
      toast.success(`${values.full_name} を登録しました`);
      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : "登録に失敗しました";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          {item.file.name}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {item.status === "extracting" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
            <Loader2 className="size-4 animate-spin" />
            AIで履歴書を解析中...
          </div>
        )}
        {item.status === "error" && (
          <div className="text-sm text-destructive py-4">
            抽出に失敗しました: {item.errorMessage}
          </div>
        )}
        {item.status === "ready" && (
          <form onSubmit={onSubmit} className="space-y-4">
            <CandidateFormFields form={form} idPrefix={`${item.id}-`} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onRemove} disabled={saving}>
                破棄
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                登録
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
