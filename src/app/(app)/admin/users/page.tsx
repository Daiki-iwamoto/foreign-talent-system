import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InviteUserDialog } from "@/components/admin/invite-user-dialog";

export const metadata = {
  title: "ユーザー管理 | 求職者管理システム",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const service = createServiceRoleClient();
  const { data: profiles } = await service
    .from("profiles")
    .select("id, name, email, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">ユーザー管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            社内ユーザーの追加と一覧を管理します
          </p>
        </div>
        <InviteUserDialog />
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>氏名</TableHead>
              <TableHead>メールアドレス</TableHead>
              <TableHead className="w-[240px]">登録日</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(profiles?.length ?? 0) === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                  ユーザーがいません
                </TableCell>
              </TableRow>
            )}
            {profiles?.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {format(new Date(u.created_at), "yyyy/MM/dd HH:mm", { locale: ja })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
