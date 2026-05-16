-- =====================================================================
-- Supabase Storage: resumes バケット
-- private(認証済みユーザーのみアクセス可)
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  20971520, -- 20MB
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 認証済みユーザーは resumes バケットを参照可
create policy "resumes_read_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'resumes');

create policy "resumes_insert_authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'resumes');

create policy "resumes_delete_authenticated"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'resumes');
