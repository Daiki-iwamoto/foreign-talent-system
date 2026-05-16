-- =====================================================================
-- Row Level Security ポリシー
-- 社内利用のため「認証済みユーザーなら全レコードを読み書き可」のシンプル運用
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.candidates enable row level security;
alter table public.status_history enable row level security;

-- profiles: 認証済みなら全行参照可、自分の行のみ更新可。INSERT は service_role のみ
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- candidates: 認証済みなら全操作可能
create policy "candidates_select_authenticated"
  on public.candidates for select
  to authenticated
  using (true);

create policy "candidates_insert_authenticated"
  on public.candidates for insert
  to authenticated
  with check (true);

create policy "candidates_update_authenticated"
  on public.candidates for update
  to authenticated
  using (true)
  with check (true);

create policy "candidates_delete_authenticated"
  on public.candidates for delete
  to authenticated
  using (true);

-- status_history: 認証済みなら参照・追加可。更新/削除は不可(履歴は不変)
create policy "status_history_select_authenticated"
  on public.status_history for select
  to authenticated
  using (true);

create policy "status_history_insert_authenticated"
  on public.status_history for insert
  to authenticated
  with check (true);
