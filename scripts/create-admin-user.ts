/**
 * 初期管理者ユーザー作成スクリプト
 *
 * 使い方:
 *   1) .env.local に SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL,
 *      ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME を設定
 *   2) npm run create-admin
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME ?? "管理者";

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    console.error(`[create-admin] 環境変数 ${name} が設定されていません`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl);
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY", serviceRoleKey);
  const email = requireEnv("ADMIN_EMAIL", adminEmail);
  const password = requireEnv("ADMIN_PASSWORD", adminPassword);

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`[create-admin] ${email} で管理者を作成します...`);

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    console.log(`[create-admin] 既に ${email} は登録済みです (id=${existing.id})`);
    return;
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: adminName },
  });

  if (createError || !created.user) {
    console.error("[create-admin] 作成失敗:", createError?.message);
    process.exit(1);
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: created.user.id,
    email,
    name: adminName,
  });
  if (profileError) {
    console.error("[create-admin] profile insert 失敗:", profileError.message);
    process.exit(1);
  }

  console.log(`[create-admin] 完了。${email} でログインしてください。`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
