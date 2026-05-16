import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { statusChangePayloadSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = statusChangePayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力値が不正です" }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { data: current, error: fetchError } = await service
    .from("candidates")
    .select("current_status")
    .eq("id", id)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ error: "求職者が見つかりません" }, { status: 404 });
  }

  if (current.current_status === parsed.data.to_status) {
    return NextResponse.json({ error: "現在のステータスと同じです" }, { status: 400 });
  }

  const { error: updateError } = await service
    .from("candidates")
    .update({ current_status: parsed.data.to_status })
    .eq("id", id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { error: historyError } = await service.from("status_history").insert({
    candidate_id: id,
    from_status: current.current_status,
    to_status: parsed.data.to_status,
    changed_by: user.id,
    comment: parsed.data.comment,
  });
  if (historyError) {
    console.error("[status history insert]", historyError);
  }

  return NextResponse.json({ ok: true });
}
