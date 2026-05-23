import Link from "next/link";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CANDIDATE_STATUSES, type CandidateStatus } from "@/lib/status";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CandidateRow } from "@/components/candidates/candidate-row";
import { CandidatesFilterBar } from "@/components/candidates/candidates-filter-bar";
import { CandidatesPagination } from "@/components/candidates/candidates-pagination";

const PAGE_SIZE = 50;

export const metadata = {
  title: "求職者一覧 | 求職者管理システム",
};

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const statusFilter = (params.status?.split(",").filter((s): s is CandidateStatus =>
    (CANDIDATE_STATUSES as readonly string[]).includes(s)
  ) ?? []) as CandidateStatus[];

  const supabase = await createClient();
  let query = supabase
    .from("candidates")
    .select(
      "id, full_name, nationality, industry, company_name, current_status, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (q) {
    const escaped = q.replace(/[%,]/g, (m) => `\\${m}`);
    query = query.or(
      `full_name.ilike.%${escaped}%,nationality.ilike.%${escaped}%,industry.ilike.%${escaped}%,company_name.ilike.%${escaped}%`
    );
  }
  if (statusFilter.length > 0) {
    query = query.in("current_status", statusFilter);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data: candidates, count, error } = await query.range(from, to);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">求職者一覧</h1>
          <p className="text-sm text-muted-foreground mt-1">
            登録された求職者を検索・フィルターできます
          </p>
        </div>
        <Button asChild>
          <Link href="/candidates/upload">
            <Upload className="size-4" />
            履歴書アップロード
          </Link>
        </Button>
      </div>

      <CandidatesFilterBar />

      <div className="bg-card border rounded-lg overflow-x-auto">
        <Table className="table-fixed min-w-[1100px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px] whitespace-nowrap">氏名</TableHead>
              <TableHead className="w-[120px] whitespace-nowrap">国籍</TableHead>
              <TableHead className="w-[180px] whitespace-nowrap">業界</TableHead>
              <TableHead className="w-[280px] whitespace-nowrap">企業名</TableHead>
              <TableHead className="w-[180px] whitespace-nowrap">ステータス</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-destructive py-12">
                  読み込みに失敗しました: {error.message}
                </TableCell>
              </TableRow>
            )}
            {!error && (candidates?.length ?? 0) === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                  該当する求職者がいません
                </TableCell>
              </TableRow>
            )}
            {candidates?.map((c) => (
              <CandidateRow
                key={c.id}
                id={c.id}
                full_name={c.full_name}
                nationality={c.nationality}
                industry={c.industry}
                company_name={c.company_name}
                current_status={c.current_status}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <CandidatesPagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
    </div>
  );
}
