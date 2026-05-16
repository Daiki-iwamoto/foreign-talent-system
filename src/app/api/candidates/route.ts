import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { createCandidatePayloadSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const payloadRaw = formData.get("payload");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "PDFファイルが必要です" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "PDFファイルを指定してください" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "ファイルサイズが大きすぎます(20MB上限)" }, { status: 400 });
  }
  if (typeof payloadRaw !== "string") {
    return NextResponse.json({ error: "payload が見つかりません" }, { status: 400 });
  }

  let parsedPayload;
  try {
    parsedPayload = JSON.parse(payloadRaw);
  } catch {
    return NextResponse.json({ error: "payload のJSONが不正です" }, { status: 400 });
  }

  const parsed = createCandidatePayloadSchema
    .omit({ pdf_file_path: true })
    .safeParse(parsedPayload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力値が不正です", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const service = createServiceRoleClient();

  // 1. candidate INSERT
  const insertData = {
    ...parsed.data,
    pdf_file_path: "", // 一旦空でINSERTし、ID確定後にStorageへアップロード+UPDATE
    created_by: user.id,
  };
  const { data: candidate, error: insertError } = await service
    .from("candidates")
    .insert(insertData)
    .select("id")
    .single();

  if (insertError || !candidate) {
    console.error("[candidates POST] insert error:", insertError);
    return NextResponse.json(
      { error: insertError?.message ?? "登録に失敗しました" },
      { status: 500 }
    );
  }

  // 2. Storage アップロード
  const safeName = file.name.replace(/[^\w.\-]/g, "_");
  const filePath = `${candidate.id}/${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await service.storage
    .from("resumes")
    .upload(filePath, buffer, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    console.error("[candidates POST] upload error:", uploadError);
    await service.from("candidates").delete().eq("id", candidate.id);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // 3. pdf_file_path UPDATE
  const { error: updateError } = await service
    .from("candidates")
    .update({ pdf_file_path: filePath })
    .eq("id", candidate.id);
  if (updateError) {
    console.error("[candidates POST] update path error:", updateError);
  }

  // 4. 初期 status_history INSERT
  await service.from("status_history").insert({
    candidate_id: candidate.id,
    from_status: null,
    to_status: "searching",
    changed_by: user.id,
    comment: "初回登録",
  });

  return NextResponse.json({ id: candidate.id });
}
