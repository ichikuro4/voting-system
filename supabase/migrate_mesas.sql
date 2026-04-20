-- Agrega soporte de mesas al control de acceso por documento.
-- Mapeo oficial:
-- 1AS -> mesa 1
-- 1BS -> mesa 2
-- 2AS -> mesa 3
-- 2BS -> mesa 4
-- 3AS -> mesa 5
-- 3BS -> mesa 6
-- 4TO -> mesa 7

alter table voter_access
  add column if not exists mesa_numero smallint,
  add column if not exists mesa_aula text;

update voter_access
set mesa_aula = upper(trim(mesa_aula))
where mesa_aula is not null;

alter table voter_access
  drop constraint if exists voter_access_mesa_numero_check;

alter table voter_access
  add constraint voter_access_mesa_numero_check
  check (mesa_numero is null or mesa_numero between 1 and 7);

alter table voter_access
  drop constraint if exists voter_access_mesa_aula_check;

alter table voter_access
  add constraint voter_access_mesa_aula_check
  check (
    mesa_aula is null
    or mesa_aula in ('1AS', '1BS', '2AS', '2BS', '3AS', '3BS', '4TO')
  );

alter table voter_access
  drop constraint if exists voter_access_mesa_mapping_check;

alter table voter_access
  add constraint voter_access_mesa_mapping_check
  check (
    (mesa_numero is null and mesa_aula is null)
    or (mesa_numero = 1 and mesa_aula = '1AS')
    or (mesa_numero = 2 and mesa_aula = '1BS')
    or (mesa_numero = 3 and mesa_aula = '2AS')
    or (mesa_numero = 4 and mesa_aula = '2BS')
    or (mesa_numero = 5 and mesa_aula = '3AS')
    or (mesa_numero = 6 and mesa_aula = '3BS')
    or (mesa_numero = 7 and mesa_aula = '4TO')
  );

create index if not exists voter_access_mesa_numero_idx on voter_access(mesa_numero);
