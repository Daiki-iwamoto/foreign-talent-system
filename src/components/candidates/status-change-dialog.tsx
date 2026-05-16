"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CANDIDATE_STATUSES, STATUS_META, type CandidateStatus } from "@/lib/status";
import { StatusBadge } from "@/components/candidates/status-badge";

export function StatusChangeDialog({
  candidateId,
  currentStatus,
}: {
  candidateId: string;
  currentStatus: CandidateStatus;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<CandidateStatus>(currentStatus);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleOpenChange(o: boolean) {
    setOpen(o);
    if (o) {
      setNewStatus(currentStatus);
      setComment("");
    }
  }

  async function submit() {
    if (newStatus === currentStatus) {
      toast.error("現在と異なるステータスを選択してください");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_status: newStatus, comment }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "ステータス変更に失敗しました");
      toast.success("ステータスを更新しました");
      setOpen(false);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "ステータス変更に失敗しました";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          ステータス変更
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ステータス変更</DialogTitle>
          <DialogDescription>
            現在のステータス: <StatusBadge status={currentStatus} />
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>新しいステータス</Label>
            <Select
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as CandidateStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CANDIDATE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>コメント(任意)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="変更理由などをメモ"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            キャンセル
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            変更する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
