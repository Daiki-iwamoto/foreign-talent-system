"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CANDIDATE_STATUSES, STATUS_META, type CandidateStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

export function CandidatesFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialQ = searchParams.get("q") ?? "";
  const initialStatuses = useMemo<CandidateStatus[]>(() => {
    const param = searchParams.get("status");
    if (!param) return [];
    const list = param.split(",").filter((s): s is CandidateStatus =>
      (CANDIDATE_STATUSES as readonly string[]).includes(s)
    );
    return list;
  }, [searchParams]);

  const [q, setQ] = useState(initialQ);
  const [selectedStatuses, setSelectedStatuses] = useState<CandidateStatus[]>(initialStatuses);

  // debounced search
  useEffect(() => {
    const handle = setTimeout(() => {
      pushQuery(q, selectedStatuses);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function pushQuery(nextQ: string, statuses: CandidateStatus[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextQ) params.set("q", nextQ);
    else params.delete("q");
    if (statuses.length > 0) params.set("status", statuses.join(","));
    else params.delete("status");
    params.delete("page");
    startTransition(() => {
      router.push(`/candidates?${params.toString()}`);
    });
  }

  function toggleStatus(s: CandidateStatus) {
    const next = selectedStatuses.includes(s)
      ? selectedStatuses.filter((x) => x !== s)
      : [...selectedStatuses, s];
    setSelectedStatuses(next);
    pushQuery(q, next);
  }

  function clearStatus() {
    setSelectedStatuses([]);
    pushQuery(q, []);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[280px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="氏名・国籍・業界・企業名で検索"
          className="pl-9"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="size-4" />
            ステータス
            {selectedStatuses.length > 0 && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5 leading-none">
                {selectedStatuses.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-1">
            {CANDIDATE_STATUSES.map((s) => {
              const checked = selectedStatuses.includes(s);
              return (
                <label
                  key={s}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
                  )}
                >
                  <Checkbox checked={checked} onCheckedChange={() => toggleStatus(s)} />
                  <span className={cn("size-2 rounded-full", STATUS_META[s].dotClass)} />
                  <span>{STATUS_META[s].label}</span>
                </label>
              );
            })}
            {selectedStatuses.length > 0 && (
              <button
                type="button"
                onClick={clearStatus}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-1.5 mt-1 border-t"
              >
                クリア
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {isPending && <span className="text-xs text-muted-foreground">更新中...</span>}
    </div>
  );
}
