"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function Header({ userName, userEmail }: { userName: string; userEmail: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("ログアウトしました");
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-14 border-b bg-card flex items-center justify-end px-6 gap-4">
      <div className="text-right">
        <p className="text-sm font-medium leading-tight">{userName}</p>
        <p className="text-xs text-muted-foreground leading-tight">{userEmail}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        <LogOut className="size-4" />
        ログアウト
      </Button>
    </header>
  );
}
