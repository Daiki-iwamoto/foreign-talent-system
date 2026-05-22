/**
 * candidates テーブルに company_name カラムを追加する一回限りのスクリプト
 * 既に存在する場合は何もしない
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("環境変数が不足しています");
  process.exit(1);
}

// Project ref を URL から抽出
const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
const endpoint = `https://api.supabase.com/platform/pg-meta/${projectRef}/query`;

async function main() {
  const sql = `alter table public.candidates add column if not exists company_name text;`;
  console.log(`[migrate] Project: ${projectRef}`);
  console.log(`[migrate] SQL: ${sql}`);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  console.log(`[migrate] Status: ${res.status}`);
  console.log(`[migrate] Response: ${text}`);

  if (!res.ok) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
