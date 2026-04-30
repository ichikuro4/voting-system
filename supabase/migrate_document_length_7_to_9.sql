-- Permite documentos de 7 a 9 digitos en padron, accesos y votos.
-- Ejecuta este script si tu base ya tenia las constraints de 8 a 9 digitos.

alter table if exists eligible_voters
  drop constraint if exists eligible_voters_dni_check;

alter table if exists eligible_voters
  add constraint eligible_voters_dni_check
  check (dni ~ '^[0-9]{7,9}$');

alter table if exists voter_access
  drop constraint if exists voter_access_dni_check;

alter table if exists voter_access
  add constraint voter_access_dni_check
  check (dni ~ '^[0-9]{7,9}$');

alter table if exists votes
  drop constraint if exists votes_student_dni_check;

alter table if exists votes
  add constraint votes_student_dni_check
  check (student_dni ~ '^[0-9]{7,9}$');
