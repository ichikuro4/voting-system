-- Agrega padron oficial por DNI y mesa.
-- Carga el CSV desde Supabase con columnas:
-- dni,mesa_numero,mesa_aula,student_name
--
-- student_name es opcional. mesa_aula debe estar en mayusculas:
-- 1AS, 1BS, 2AS, 2BS, 3AS, 3BS, 4TO, 5TO.

create table if not exists eligible_voters (
  dni text primary key,
  mesa_numero smallint not null,
  mesa_aula text not null,
  student_name text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint eligible_voters_dni_check check (dni ~ '^[0-9]{7,9}$'),
  constraint eligible_voters_mesa_numero_check check (mesa_numero between 1 and 8),
  constraint eligible_voters_mesa_aula_check check (
    mesa_aula in ('1AS', '1BS', '2AS', '2BS', '3AS', '3BS', '4TO', '5TO')
  ),
  constraint eligible_voters_mesa_mapping_check check (
    (mesa_numero = 1 and mesa_aula = '1AS')
    or (mesa_numero = 2 and mesa_aula = '1BS')
    or (mesa_numero = 3 and mesa_aula = '2AS')
    or (mesa_numero = 4 and mesa_aula = '2BS')
    or (mesa_numero = 5 and mesa_aula = '3AS')
    or (mesa_numero = 6 and mesa_aula = '3BS')
    or (mesa_numero = 7 and mesa_aula = '4TO')
    or (mesa_numero = 8 and mesa_aula = '5TO')
  )
);

update eligible_voters
set mesa_aula = upper(trim(mesa_aula));

alter table eligible_voters
  drop constraint if exists eligible_voters_dni_check;

alter table eligible_voters
  add constraint eligible_voters_dni_check
  check (dni ~ '^[0-9]{7,9}$');

alter table eligible_voters
  drop constraint if exists eligible_voters_mesa_aula_check;

alter table eligible_voters
  add constraint eligible_voters_mesa_aula_check
  check (mesa_aula in ('1AS', '1BS', '2AS', '2BS', '3AS', '3BS', '4TO', '5TO'));

alter table eligible_voters
  drop constraint if exists eligible_voters_mesa_mapping_check;

alter table eligible_voters
  add constraint eligible_voters_mesa_mapping_check
  check (
    (mesa_numero = 1 and mesa_aula = '1AS')
    or (mesa_numero = 2 and mesa_aula = '1BS')
    or (mesa_numero = 3 and mesa_aula = '2AS')
    or (mesa_numero = 4 and mesa_aula = '2BS')
    or (mesa_numero = 5 and mesa_aula = '3AS')
    or (mesa_numero = 6 and mesa_aula = '3BS')
    or (mesa_numero = 7 and mesa_aula = '4TO')
    or (mesa_numero = 8 and mesa_aula = '5TO')
  );

create index if not exists eligible_voters_mesa_numero_idx on eligible_voters(mesa_numero);

alter table eligible_voters enable row level security;

-- No se crean politicas publicas para proteger el padron de DNIs.
-- La app consulta esta tabla desde el servidor con SUPABASE_SERVICE_ROLE_KEY.

comment on table eligible_voters is 'Padron oficial de documentos habilitados y mesa asignada.';
