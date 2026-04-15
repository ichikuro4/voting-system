-- Migracion para actualizar el proceso a 2 listas oficiales.
-- Si existen votos previos, primero reinicia la votacion desde el panel admin.

delete from votes
where id is not null;

delete from voter_access
where dni is not null;

delete from committees
where id is not null;

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
