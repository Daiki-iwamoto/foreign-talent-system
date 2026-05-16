import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/candidates/status-badge";
import type { StatusHistoryWithUser } from "@/types/database";

export function StatusTimeline({ items }: { items: StatusHistoryWithUser[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">履歴はまだありません</p>;
  }

  return (
    <ol className="space-y-4">
      {items.map((h) => (
        <li key={h.id} className="border-l-2 border-muted pl-4 relative">
          <span className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-primary" />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {h.from_status ? (
              <>
                <StatusBadge status={h.from_status} />
                <ArrowRight className="size-3 text-muted-foreground" />
                <StatusBadge status={h.to_status} />
              </>
            ) : (
              <StatusBadge status={h.to_status} />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(h.created_at), "yyyy/MM/dd HH:mm", { locale: ja })}
            {" · "}
            {h.changed_by_profile?.name ?? h.changed_by_profile?.email ?? "システム"}
          </p>
          {h.comment && (
            <p className="text-sm mt-1.5 bg-muted/50 rounded px-2 py-1.5">{h.comment}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
