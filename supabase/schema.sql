-- Sistema de votacion escolar
-- Ejecuta este script en el SQL Editor de Supabase.

create extension if not exists "pgcrypto";

drop table if exists votes cascade;
drop table if exists voter_access cascade;
drop table if exists eligible_voters cascade;
drop table if exists election_settings cascade;
drop table if exists committees cascade;
drop table if exists admin_audit_logs cascade;

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
  process_name text not null default 'Elecciones del Municipio Escolar',
  is_open boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table eligible_voters (
  dni text primary key,
  mesa_numero smallint not null,
  mesa_aula text not null,
  student_name text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint eligible_voters_dni_check check (dni ~ '^[0-9]{7,9}$'),
  constraint eligible_voters_mesa_numero_check check (mesa_numero between 1 and 7),
  constraint eligible_voters_mesa_aula_check check (
    mesa_aula in ('1AS', '1BS', '2AS', '2BS', '3AS', '3BS', '4TO')
  ),
  constraint eligible_voters_mesa_mapping_check check (
    (mesa_numero = 1 and mesa_aula = '1AS')
    or (mesa_numero = 2 and mesa_aula = '1BS')
    or (mesa_numero = 3 and mesa_aula = '2AS')
    or (mesa_numero = 4 and mesa_aula = '2BS')
    or (mesa_numero = 5 and mesa_aula = '3AS')
    or (mesa_numero = 6 and mesa_aula = '3BS')
    or (mesa_numero = 7 and mesa_aula = '4TO')
  )
);

create table voter_access (
  dni text primary key,
  has_voted boolean not null default false,
  mesa_numero smallint,
  mesa_aula text,
  created_at timestamptz not null default timezone('utc', now()),
  voted_at timestamptz,
  constraint voter_access_dni_check check (dni ~ '^[0-9]{7,9}$'),
  constraint voter_access_mesa_numero_check check (mesa_numero is null or mesa_numero between 1 and 7),
  constraint voter_access_mesa_aula_check check (
    mesa_aula is null
    or mesa_aula in ('1AS', '1BS', '2AS', '2BS', '3AS', '3BS', '4TO')
  ),
  constraint voter_access_mesa_mapping_check check (
    (mesa_numero is null and mesa_aula is null)
    or (mesa_numero = 1 and mesa_aula = '1AS')
    or (mesa_numero = 2 and mesa_aula = '1BS')
    or (mesa_numero = 3 and mesa_aula = '2AS')
    or (mesa_numero = 4 and mesa_aula = '2BS')
    or (mesa_numero = 5 and mesa_aula = '3AS')
    or (mesa_numero = 6 and mesa_aula = '3BS')
    or (mesa_numero = 7 and mesa_aula = '4TO')
  )
);

create table votes (
  id uuid primary key default gen_random_uuid(),
  student_dni text not null unique references voter_access(dni) on delete restrict,
  committee_id uuid references committees(id) on delete restrict,
  vote_blank boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  constraint votes_selection_check check (
    (vote_blank = true and committee_id is null)
    or
    (vote_blank = false and committee_id is not null)
  ),
  constraint votes_student_dni_check check (student_dni ~ '^[0-9]{7,9}$')
);

create table admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_username text not null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

create index votes_committee_id_idx on votes(committee_id);
create index votes_created_at_idx on votes(created_at desc);
create index committees_active_idx on committees(active);
create index eligible_voters_mesa_numero_idx on eligible_voters(mesa_numero);
create index voter_access_has_voted_idx on voter_access(has_voted);
create index voter_access_mesa_numero_idx on voter_access(mesa_numero);
create index admin_audit_logs_created_at_idx on admin_audit_logs(created_at desc);
create index admin_audit_logs_action_idx on admin_audit_logs(action);

insert into committees (name, short_description, color, active)
values
  (
    'Lista N° 1 - Maria Luisa Oliva Vásquez',
    null,
    '#0f766e',
    true
  ),
  (
    'Lista N° 2 - Sol De María Anticona Gutiérrez',
    null,
    '#0284c7',
    true
  );

insert into election_settings (process_name, is_open)
values ('Elecciones del Municipio Escolar', true);

insert into eligible_voters (dni, mesa_numero, mesa_aula, student_name)
values
  ('70000001', 1, '1AS', 'Alumno de prueba 1'),
  ('70000002', 2, '1BS', 'Alumno de prueba 2'),
  ('70000003', 3, '2AS', 'Alumno de prueba 3'),
  ('70000004', 4, '2BS', 'Alumno de prueba 4'),
  ('70000005', 5, '3AS', 'Alumno de prueba 5');

insert into voter_access (dni, has_voted, voted_at, mesa_numero, mesa_aula)
values
  ('70000001', true, timezone('utc', now()), 1, '1AS'),
  ('70000002', true, timezone('utc', now()), 2, '1BS'),
  ('70000003', true, timezone('utc', now()), 3, '2AS'),
  ('70000004', true, timezone('utc', now()), 4, '2BS'),
  ('70000005', true, timezone('utc', now()), 5, '3AS');

insert into votes (student_dni, committee_id, vote_blank)
select '70000001', id, false
from committees
where name = 'Lista N° 1 - Maria Luisa Oliva Vásquez'
limit 1;

insert into votes (student_dni, committee_id, vote_blank)
select '70000002', id, false
from committees
where name = 'Lista N° 1 - Maria Luisa Oliva Vásquez'
limit 1;

insert into votes (student_dni, committee_id, vote_blank)
select '70000003', id, false
from committees
where name = 'Lista N° 2 - Sol De María Anticona Gutiérrez'
limit 1;

insert into votes (student_dni, committee_id, vote_blank)
select '70000004', id, false
from committees
where name = 'Lista N° 2 - Sol De María Anticona Gutiérrez'
limit 1;

insert into votes (student_dni, committee_id, vote_blank)
values ('70000005', null, true);

alter table committees enable row level security;
alter table election_settings enable row level security;
alter table eligible_voters enable row level security;
alter table voter_access enable row level security;
alter table votes enable row level security;
alter table admin_audit_logs enable row level security;

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

comment on table committees is 'Catalogo de listas para la votacion del Municipio Escolar.';
comment on table eligible_voters is 'Padron oficial de documentos habilitados y mesa asignada.';
comment on table voter_access is 'Control de acceso por documento (DNI/CE) y mesa para evitar votos duplicados.';
comment on table votes is 'Registro de votos emitidos, un voto por documento.';
comment on table election_settings is 'Configuracion general del proceso electoral.';
comment on table admin_audit_logs is 'Bitacora de acciones administrativas del sistema.';
