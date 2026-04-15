-- Migracion incremental para instalaciones existentes
-- Agrega el flujo por documento (DNI/CE) sin eliminar datos actuales.

create table if not exists voter_access (
  dni text primary key,
  has_voted boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  voted_at timestamptz,
  constraint voter_access_dni_check check (dni ~ '^[0-9]{8,9}$')
);

alter table if exists voter_access enable row level security;
alter table voter_access
  drop constraint if exists voter_access_dni_check;
alter table voter_access
  add constraint voter_access_dni_check
  check (dni ~ '^[0-9]{8,9}$');

alter table votes add column if not exists student_dni text;

with numbered_votes as (
  select
    id,
    lpad((90000000 + row_number() over (order by created_at, id))::text, 8, '0') as synthetic_dni
  from votes
  where student_dni is null
)
update votes
set student_dni = numbered_votes.synthetic_dni
from numbered_votes
where votes.id = numbered_votes.id;

alter table votes
  drop constraint if exists votes_student_dni_check;

alter table votes
  add constraint votes_student_dni_check
  check (student_dni is null or student_dni ~ '^[0-9]{8,9}$');

create unique index if not exists votes_student_dni_unique_idx
on votes(student_dni)
where student_dni is not null;

insert into voter_access (dni, has_voted, voted_at)
select
  student_dni,
  true,
  max(created_at)
from votes
where student_dni is not null
group by student_dni
on conflict (dni) do update
set
  has_voted = true,
  voted_at = coalesce(voter_access.voted_at, excluded.voted_at);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'votes_student_dni_fkey'
  ) then
    alter table votes
      add constraint votes_student_dni_fkey
      foreign key (student_dni)
      references voter_access(dni)
      on delete restrict;
  end if;
end $$;

alter table votes
  alter column student_dni set not null;

drop policy if exists "Public can read voter access" on voter_access;
drop policy if exists "Public can insert voter access" on voter_access;
drop policy if exists "Public can update voter access to voted" on voter_access;

create policy "Public can read voter access"
on voter_access
for select
to anon, authenticated
using (true);

create policy "Public can insert voter access"
on voter_access
for insert
to anon, authenticated
with check (has_voted = false);

create policy "Public can update voter access to voted"
on voter_access
for update
to anon, authenticated
using (true)
with check (has_voted = true);

create index if not exists voter_access_has_voted_idx on voter_access(has_voted);
