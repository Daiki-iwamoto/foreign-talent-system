"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function InlineCompanyChanger({
  candidateId,
  initialValue,
}: {
  candidateId: string;
  initialValue: string | null;
}) {
  const router = useRouter();
  const [committed, setCommitted] = useState(initialValue ?? "");
  const [draft, setDraft] = useState(initialValue ?? "");
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadCompanies() {
    if (companies.length > 0 || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notion/companies");
      const json = await res.json();
      if (res.ok) setCompanies(json.companies ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function commit(nextValue: string) {
    const v = nextValue.trim();
    setDraft(v);
    setOpen(false);
    if (v === committed) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/company`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: v }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "保存失敗");
      setCommitted(v);
      toast.success(v ? `企業名: ${v}` : "企業名をクリアしました");
      router.refresh();
    } catch (err) {
      setDraft(committed);
      toast.error(err instanceof Error ? err.message : "保存失敗");
    } finally {
      setSaving(false);
    }
  }

  // 外側クリック → 現在の draft をコミット
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        commit(draft);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, draft, committed]);

  const filtered = useMemo(() => {
    if (!draft.trim()) return companies;
    const q = draft.toLowerCase();
    return companies.filter((c) => c.toLowerCase().includes(q));
  }, [companies, draft]);

  const showCreate =
    draft.trim().length > 0 &&
    !companies.some((c) => c.toLowerCase() === draft.trim().toLowerCase());

  return (
    <div
      ref={wrapRef}
      className="relative inline-block w-full max-w-[260px]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            loadCompanies();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(draft);
              inputRef.current?.blur();
            } else if (e.key === "Escape") {
              setDraft(committed);
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={committed ? committed : "未設定"}
          className={cn(
            "h-7 w-full rounded-md border border-input bg-transparent pl-2 pr-12 text-xs",
            "focus:outline-none focus:ring-1 focus:ring-ring",
            "placeholder:text-muted-foreground",
            !committed && "text-muted-foreground"
          )}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {saving ? (
            <Loader2 className="size-3 animate-spin text-muted-foreground" />
          ) : (
            <>
              {draft && (
                <button
                  type="button"
                  onClick={() => commit("")}
                  className="p-0.5 text-muted-foreground hover:text-foreground"
                  title="クリア"
                >
                  <X className="size-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setOpen((o) => !o);
                  loadCompanies();
                  inputRef.current?.focus();
                }}
                className="p-0.5 text-muted-foreground hover:text-foreground"
              >
                <ChevronDown
                  className={cn("size-3 transition-transform", open && "rotate-180")}
                />
              </button>
            </>
          )}
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] max-h-64 overflow-y-auto rounded-md border bg-popover shadow-md text-xs">
          {loading && companies.length === 0 && (
            <div className="px-2 py-1.5 text-muted-foreground flex items-center gap-2">
              <Loader2 className="size-3 animate-spin" />
              Notionから取得中…
            </div>
          )}
          {!loading && filtered.length === 0 && !showCreate && (
            <div className="px-2 py-1.5 text-muted-foreground">候補なし</div>
          )}
          {showCreate && (
            <button
              type="button"
              onClick={() => commit(draft)}
              className="w-full text-left px-2 py-1.5 hover:bg-muted border-b"
            >
              <span className="text-muted-foreground">新規:</span>{" "}
              <span className="font-medium">{draft.trim()}</span>
            </button>
          )}
          {filtered.map((c) => {
            const isSelected = c === committed;
            return (
              <button
                key={c}
                type="button"
                onClick={() => commit(c)}
                className={cn(
                  "w-full text-left px-2 py-1.5 hover:bg-muted flex items-center justify-between gap-2",
                  isSelected && "bg-muted"
                )}
              >
                <span className="truncate">{c}</span>
                {isSelected && <Check className="size-3 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
