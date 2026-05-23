"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
};

export function CompanyCombobox({ value, onChange, id }: Props) {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // 初回フォーカス時に取得
  async function loadCompanies() {
    if (loaded || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notion/companies");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "取得失敗");
      setCompanies(json.companies ?? []);
      setLoaded(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Notion 取得失敗");
    } finally {
      setLoading(false);
    }
  }

  // 外側クリックで閉じる
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const filtered = useMemo(() => {
    if (!value.trim()) return companies;
    const q = value.toLowerCase();
    return companies.filter((c) => c.toLowerCase().includes(q));
  }, [companies, value]);

  const showCreateOption =
    value.trim().length > 0 &&
    !companies.some((c) => c.toLowerCase() === value.trim().toLowerCase());

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            loadCompanies();
          }}
          placeholder="企業名を入力(Notionから候補)"
          className="pr-7"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            loadCompanies();
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
          )}
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto rounded-md border bg-popover shadow-md text-sm">
          {loading && companies.length === 0 && (
            <div className="px-3 py-2 text-muted-foreground flex items-center gap-2">
              <Loader2 className="size-3 animate-spin" />
              Notionから取得中…
            </div>
          )}
          {errorMsg && (
            <div className="px-3 py-2 text-destructive">{errorMsg}</div>
          )}
          {!loading && filtered.length === 0 && !showCreateOption && (
            <div className="px-3 py-2 text-muted-foreground">候補がありません</div>
          )}
          {showCreateOption && (
            <button
              type="button"
              onClick={() => {
                onChange(value.trim());
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-muted border-b"
            >
              <span className="text-muted-foreground">新規:</span>{" "}
              <span className="font-medium">{value.trim()}</span>
            </button>
          )}
          {filtered.map((c) => {
            const isSelected = c === value;
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between gap-2",
                  isSelected && "bg-muted"
                )}
              >
                <span className="truncate">{c}</span>
                {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
