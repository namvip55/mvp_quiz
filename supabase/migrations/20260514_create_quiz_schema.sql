create extension if not exists pgcrypto;

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  question_number integer not null,
  content text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  unique (exam_id, question_number)
);

create table if not exists public.options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  content text not null,
  is_correct boolean not null default false,
  sort_order integer not null,
  created_at timestamptz not null default now()
);

create or replace function public.enforce_single_correct_option()
returns trigger
language plpgsql
as $$
declare
  qid uuid;
  correct_count integer;
begin
  qid := coalesce(new.question_id, old.question_id);

  select count(*)
  into correct_count
  from public.options
  where question_id = qid
    and is_correct = true;

  if correct_count <> 1 then
    raise exception 'Each question must have exactly one correct option. question_id=% correct_count=%', qid, correct_count;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_enforce_single_correct_option on public.options;

create constraint trigger trg_enforce_single_correct_option
after insert or update or delete on public.options
deferrable initially deferred
for each row
execute function public.enforce_single_correct_option();

alter table public.exams enable row level security;
alter table public.questions enable row level security;
alter table public.options enable row level security;

drop policy if exists "public_read_write_exams" on public.exams;
create policy "public_read_write_exams"
on public.exams
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public_read_write_questions" on public.questions;
create policy "public_read_write_questions"
on public.questions
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public_read_write_options" on public.options;
create policy "public_read_write_options"
on public.options
for all
to anon, authenticated
using (true)
with check (true);
