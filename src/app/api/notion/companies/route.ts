import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchCompanyNames } from "@/lib/notion/fetch-companies";

export const runtime = "nodejs";
// 5分キャッシュ(Notion APIのレート制限対策 + UXの応答速度)
export const revalidate = 300;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  try {
    const companies = await fetchCompanyNames();
    return NextResponse.json({ companies });
  } catch (err) {
    console.error("[notion/companies] failed:", err);
    const message = err instanceof Error ? err.message : "取得失敗";
    return NextResponse.json({ error: message, companies: [] }, { status: 500 });
  }
}
