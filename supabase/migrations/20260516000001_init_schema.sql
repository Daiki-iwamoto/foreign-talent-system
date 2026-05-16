-- =====================================================================
-- 求職者管理システム 初期スキーマ
-- =====================================================================

-- ステータス ENUM
create type candidate_status as enum (
  'searching',
  'interview_scheduling',
  'interviewed',
  'offered',
  'hired',
  'working',
  'resigned',
  'unreachable'
);

-- 社内ユーザー拡張テーブル(auth.users と 1:1)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

-- 求職者テーブル
create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  nationality text,
  date_of_birth date,
  gender text,
  email text,
  phone text,
  industry text,
  job_title text,
  work_history text,
  education text,
  current_status candidate_status not null default 'searching',
  memo text,
  pdf_file_path text not null,
  ocr_raw_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create index candidates_current_status_idx on public.candidates (current_status);
create index candidates_created_at_idx on public.candidates (created_at desc);
create index candidates_search_idx
  on public.candidates
  using gin (to_tsvector(
    'simple',
    coalesce(full_name, '') || ' ' || coalesce(nationality, '') || ' ' || coalesce(industry, '')
  ));

-- updated_at 自動更新
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger candidates_set_updated_at
  before update on public.candidates
  for each row execute procedure public.set_updated_at();

-- ステータス変更履歴
create table public.status_history (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  from_status candidate_status,
  to_status candidate_status not null,
  changed_by uuid references auth.users(id) on delete set null,
  comment text,
  created_at timestamptz not null default now()
);

create index status_history_candidate_idx
  on public.status_history (candidate_id, created_at desc);
