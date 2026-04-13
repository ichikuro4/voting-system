-- Sistema de votacion escolar
-- Ejecuta este script en el SQL Editor de Supabase.

create extension if not exists "pgcrypto";

drop table if exists votes cascade;
drop table if exists election_settings cascade;
drop table if exists committees cascade;

create table committees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_description text,
  color text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table election_settings (
  id uuid primary key default gen_random_uuid(),
  process_name text not null default 'Elecciones del colegio Brüning School',
  is_open boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid references committees(id) on delete restrict,
  vote_blank boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  constraint votes_selection_check check (
    (vote_blank = true and committee_id is null)
    or
    (vote_blank = false and committee_id is not null)
  )
);

create index votes_committee_id_idx on votes(committee_id);
create index votes_created_at_idx on votes(created_at desc);
create index committees_active_idx on committees(active);

insert into committees (name, short_description, color, active)
values
  ('Comite Futuro Verde', 'Propuestas ecologicas y espacios sostenibles.', '#0f766e', true),
  ('Comite Impulso Estudiantil', 'Actividades culturales y deportivas.', '#0284c7', true),
  ('Comite Union Escolar', 'Participacion estudiantil y convivencia.', '#f59e0b', true);

insert into election_settings (process_name, is_open)
values ('Elecciones del colegio Brüning School', true);

insert into votes (committee_id, vote_blank)
select id, false
from committees
where name = 'Comite Futuro Verde'
limit 1;

insert into votes (committee_id, vote_blank)
select id, false
from committees
where name = 'Comite Futuro Verde'
limit 1;

insert into votes (committee_id, vote_blank)
select id, false
from committees
where name = 'Comite Impulso Estudiantil'
limit 1;

insert into votes (committee_id, vote_blank)
select id, false
from committees
where name = 'Comite Union Escolar'
limit 1;

insert into votes (committee_id, vote_blank)
values (null, true);

alter table committees enable row level security;
alter table election_settings enable row level security;
alter table votes enable row level security;

create policy "Public can read committees"
on committees
for select
to anon, authenticated
using (true);

create policy "Public can read election settings"
on election_settings
for select
to anon, authenticated
using (true);

create policy "Public can insert votes"
on votes
for insert
to anon, authenticated
with check (true);

create policy "Public can read votes"
on votes
for select
to anon, authenticated
using (true);

comment on table committees is 'Catalogo de comites para la votacion escolar.';
comment on table votes is 'Registro de votos emitidos.';
comment on table election_settings is 'Configuracion general del proceso electoral.';
