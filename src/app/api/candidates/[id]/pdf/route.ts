import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
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

  const { data: candidate, error } = await service
    .from("candidates")
    .select("pdf_file_path")
    .eq("id", id)
    .maybeSingle();

  if (error || !candidate?.pdf_file_path) {
    return NextResponse.json({ error: "PDFが見つかりません" }, { status: 404 });
  }

  const { data: blob, error: downloadError } = await service.storage
    .from("resumes")
    .download(candidate.pdf_file_path);
  if (downloadError || !blob) {
    return NextResponse.json({ error: "ダウンロードに失敗しました" }, { status: 500 });
  }

  const buffer = Buffer.from(await blob.arrayBuffer());
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-cache",
    },
  });
}
