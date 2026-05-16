import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { candidateFormSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function PATCH(
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
  const parsed = candidateFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力値が不正です", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("candidates").update(parsed.data).eq("id", id);
  if (error) {
    console.error("[candidates PATCH]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
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
  const service = createServiceRoleClient();

  // 関連 PDF を Storage から削除
  const { data: candidate } = await service
    .from("candidates")
    .select("pdf_file_path")
    .eq("id", id)
    .maybeSingle();

  if (candidate?.pdf_file_path) {
    await service.storage.from("resumes").remove([candidate.pdf_file_path]);
  }

  const { error } = await service.from("candidates").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
