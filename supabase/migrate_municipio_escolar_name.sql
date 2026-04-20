-- Actualiza el nombre del proceso electoral al nuevo texto institucional.

update election_settings
set process_name = 'Elecciones del Municipio Escolar'
where process_name is null
   or process_name = ''
   or process_name = 'Elecciones del colegio Brüning School';
