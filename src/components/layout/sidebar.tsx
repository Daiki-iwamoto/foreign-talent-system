"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Upload, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/candidates", label: "求職者一覧", icon: Users, match: /^\/candidates(\/|$)/ },
  { href: "/candidates/upload", label: "履歴書アップロード", icon: Upload, match: /^\/candidates\/upload/ },
  { href: "/admin/users", label: "ユーザー管理", icon: Settings, match: /^\/admin/ },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r bg-card flex flex-col">
      <div className="px-6 py-5 border-b">
        <p className="text-lg font-semibold leading-tight">求職者管理</p>
        <p className="text-xs text-muted-foreground mt-0.5">社内システム</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match.test(pathname);
          const isUploadAfterCandidates = item.href === "/candidates/upload";
          const isCandidatesList = item.href === "/candidates";
          let isActive = active;
          if (isCandidatesList && pathname.startsWith("/candidates/upload")) {
            isActive = false;
          }
          if (isUploadAfterCandidates && !pathname.startsWith("/candidates/upload")) {
            isActive = false;
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
