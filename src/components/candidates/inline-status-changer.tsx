"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CANDIDATE_STATUSES, STATUS_META, type CandidateStatus } from "@/lib/status";

export function InlineStatusChanger({
  candidateId,
  currentStatus,
}: {
  candidateId: string;
  currentStatus: CandidateStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<CandidateStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as CandidateStatus;
    if (newStatus === status) return;

    const prevStatus = status;
    setStatus(newStatus);
    setLoading(true);

    try {
      const res = await fetch(`/api/candidates/${candidateId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_status: newStatus, comment: null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "変更に失敗しました");
      toast.success(`「${STATUS_META[newStatus].label}」に変更しました`);
      router.refresh();
    } catch (err) {
      setStatus(prevStatus);
      const message = err instanceof Error ? err.message : "変更に失敗しました";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const meta = STATUS_META[status];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative inline-block"
    >
      <select
        value={status}
        onChange={handleChange}
        disabled={loading}
        className={cn(
          "appearance-none cursor-pointer pl-5 pr-7 py-1 text-xs font-medium border rounded-md transition-opacity",
          meta.badgeClass,
          loading && "opacity-60 cursor-wait"
        )}
      >
        {CANDIDATE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_META[s].label}
          </option>
        ))}
      </select>
      <span
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 size-1.5 rounded-full pointer-events-none",
          meta.dotClass
        )}
      />
      {loading ? (
        <Loader2 className="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 animate-spin pointer-events-none" />
      ) : (
        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 pointer-events-none opacity-70" />
      )}
    </div>
  );
}
