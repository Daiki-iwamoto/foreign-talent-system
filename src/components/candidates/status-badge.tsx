import { cn } from "@/lib/utils";
import { STATUS_META, type CandidateStatus } from "@/lib/status";

export function StatusBadge({
  status,
  className,
}: {
  status: CandidateStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        meta.badgeClass,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dotClass)} />
      {meta.label}
    </span>
  );
}
