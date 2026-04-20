-- Inserta 500 votos aleatorios para pruebas.
-- Requiere que ya existan tablas voter_access, votes y al menos una lista activa.

with params as (
  select
    500::int as total_rows,
    greatest(
      coalesce(
        (
          select max(dni::bigint)
          from voter_access
          where dni ~ '^[0-9]{8,9}$'
        ),
        70000000
      ),
      70000000
    ) as base_dni
),
new_documents as (
  select
    (params.base_dni + row_number() over ())::text as dni,
    timezone('utc', now()) - (random() * interval '10 days') as voted_at,
    (((row_number() over ()) - 1) % 7 + 1)::smallint as mesa_numero
  from params
  cross join generate_series(1, (select total_rows from params))
),
inserted_access as (
  insert into voter_access (dni, has_voted, voted_at, mesa_numero, mesa_aula)
  select
    dni,
    true,
    voted_at,
    mesa_numero,
    case mesa_numero
      when 1 then '1AS'
      when 2 then '1BS'
      when 3 then '2AS'
      when 4 then '2BS'
      when 5 then '3AS'
      when 6 then '3BS'
      when 7 then '4TO'
    end as mesa_aula
  from new_documents
  on conflict (dni) do nothing
  returning dni, voted_at
),
ranked_active_committees as (
  select
    id,
    row_number() over (order by id) as rn
  from committees
  where active = true
),
active_committee_count as (
  select count(*)::int as total
  from ranked_active_committees
),
document_seeds as (
  select
    ia.dni,
    ia.voted_at,
    get_byte(decode(md5(ia.dni || '-blank'), 'hex'), 0)::int as blank_seed,
    get_byte(decode(md5(ia.dni || '-list'), 'hex'), 0)::int as list_seed,
    get_byte(decode(md5(ia.dni || '-time'), 'hex'), 0)::int as time_seed
  from inserted_access ia
),
prepared_votes as (
  select
    ds.dni as student_dni,
    case
      when ds.blank_seed < 31 then null
      when acc.total <= 0 then null
      else rac.id
    end as committee_id,
    ds.voted_at + make_interval(mins => ds.time_seed) as created_at
  from document_seeds ds
  left join active_committee_count acc on true
  left join ranked_active_committees rac
    on rac.rn = (ds.list_seed % nullif(acc.total, 0)) + 1
),
inserted_votes as (
  insert into votes (student_dni, committee_id, vote_blank, created_at)
  select
    student_dni,
    committee_id,
    committee_id is null as vote_blank,
    created_at
  from prepared_votes
  returning id
)
select
  (select count(*) from inserted_access) as documentos_insertados,
  (select count(*) from inserted_votes) as votos_insertados;
