import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractResumeFromPdf } from "@/lib/anthropic/extract-resume";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

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
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file が見つかりません" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "PDFファイルを指定してください" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "ファイルサイズが大きすぎます(20MB上限)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const extracted = await extractResumeFromPdf(buffer);
    return NextResponse.json({
      filename: file.name,
      extracted,
    });
  } catch (err) {
    console.error("[extract] failed:", err);
    const message = err instanceof Error ? err.message : "抽出に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
