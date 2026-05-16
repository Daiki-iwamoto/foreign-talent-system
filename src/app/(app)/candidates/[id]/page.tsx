import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/candidates/status-badge";
import { StatusChangeDialog } from "@/components/candidates/status-change-dialog";
import { StatusTimeline } from "@/components/candidates/status-timeline";
import { CandidateEditForm } from "@/components/candidates/candidate-edit-form";
import { DeleteCandidateButton } from "@/components/candidates/delete-candidate-button";
import { PdfViewer } from "@/components/candidates/pdf-viewer";
import type { StatusHistoryWithUser } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !candidate) {
    notFound();
  }

  const service = createServiceRoleClient();
  const { data: historyRaw } = await service
    .from("status_history")
    .select("*")
    .eq("candidate_id", id)
    .order("created_at", { ascending: false });

  const userIds = Array.from(
    new Set((historyRaw ?? []).map((h) => h.changed_by).filter((v): v is string => !!v))
  );
  const { data: profiles } = userIds.length
    ? await service.from("profiles").select("id, name, email").in("id", userIds)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const history: StatusHistoryWithUser[] = (historyRaw ?? []).map((h) => ({
    ...h,
    changed_by_profile: h.changed_by
      ? profileMap.get(h.changed_by)
        ? {
            name: profileMap.get(h.changed_by)!.name,
            email: profileMap.get(h.changed_by)!.email,
          }
        : null
      : null,
  }));

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/candidates">
              <ArrowLeft className="size-4" />
              一覧へ戻る
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">{candidate.full_name}</h1>
          <StatusBadge status={candidate.current_status} />
        </div>
        <div className="flex items-center gap-2">
          <StatusChangeDialog
            candidateId={candidate.id}
            currentStatus={candidate.current_status}
          />
          <DeleteCandidateButton
            candidateId={candidate.id}
            candidateName={candidate.full_name}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">基本情報</CardTitle>
            </CardHeader>
            <CardContent>
              <CandidateEditForm candidate={candidate} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">ステータス履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline items={history} />
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground text-right">
            登録: {format(new Date(candidate.created_at), "yyyy/MM/dd HH:mm", { locale: ja })}
            {" · "}
            更新: {format(new Date(candidate.updated_at), "yyyy/MM/dd HH:mm", { locale: ja })}
          </p>
        </div>

        <div className="xl:sticky xl:top-4 self-start">
          <PdfViewer candidateId={candidate.id} />
        </div>
      </div>
    </div>
  );
}
