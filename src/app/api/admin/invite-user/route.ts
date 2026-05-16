import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { inviteUserSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = inviteUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力値が不正です", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const service = createServiceRoleClient();
  const { data: created, error: createError } = await service.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { name: parsed.data.name },
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? "ユーザー作成に失敗しました" },
      { status: 500 }
    );
  }

  const { error: profileError } = await service.from("profiles").insert({
    id: created.user.id,
    email: parsed.data.email,
    name: parsed.data.name,
  });
  if (profileError) {
    console.error("[invite-user] profile insert:", profileError);
  }

  return NextResponse.json({ id: created.user.id });
}
