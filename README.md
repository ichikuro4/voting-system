# Sistema de Votacion Escolar

Aplicacion web de votacion escolar construida con:

- Next.js con App Router
- JavaScript puro
- Supabase como base de datos
- Tailwind CSS para estilos
- Recharts para el dashboard

La app permite:

- registrar acceso por documento (DNI o carnet de extranjeria) antes de votar
- validar que el documento pertenezca a la mesa seleccionada usando un padron CSV
- votar por una lista activa
- registrar voto en blanco
- confirmar antes de guardar
- reiniciar la pantalla para el siguiente alumno
- ver resultados en un dashboard con porcentajes y grafica
- proteger el dashboard con credenciales administrativas
- abrir/cerrar votacion desde el dashboard admin
- exportar votos en CSV o JSON
- registrar auditoria de acciones administrativas

## Estructura

```text
src/
  app/
    admin/login/page.js
    api/admin/login/route.js
    api/admin/logout/route.js
    api/admin/election/status/route.js
    api/admin/votes/export/route.js
    api/admin/votes/reset/route.js
    api/voter-access/route.js
    api/votes/route.js
    dashboard/page.js
    votar/exito/page.js
    votar/page.js
    globals.css
    layout.js
    page.js
  components/
    AdminLoginForm.js
    AdminLogoutButton.js
    ElectionStatusToggleButton.js
    ResetVotesButton.js
    ExportVotesButton.js
    ResultsChart.js
    StatsCard.js
    VoteCard.js
    VoteForm.js
    VoteSuccessPanel.js
  lib/
    admin-auth.js
    supabase.js
  services/
    committees.js
    election.js
    admin-audit.js
    voter-access.js
    votes.js
supabase/
  migrate_dni_access.sql
  migrate_two_committees.sql
  seed_500_random_votes.sql
  schema.sql
.env.local.example
```

## Instalacion paso a paso

1. Instala dependencias.

```bash
npm install
```

2. Crea tu proyecto en Supabase.

3. Abre el SQL Editor de Supabase y ejecuta el contenido de `supabase/schema.sql`.

   Para instalaciones existentes, ejecuta tambien `supabase/migrate_eligible_voters.sql` antes
   de usar la validacion por padron.

4. Crea el archivo `.env.local` tomando como base `.env.local.example`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_publica
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_solo_servidor
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_clave_segura
ADMIN_SESSION_SECRET=otra_clave_larga_y_distinta
```

`SUPABASE_SERVICE_ROLE_KEY` se usa solo en rutas administrativas del servidor (por ejemplo, abrir/cerrar votacion).

5. Inicia el servidor local.

```bash
npm run dev
```

6. Abre `http://localhost:3000`.

## Como probar

1. Entra a `/`.
2. Ingresa un documento valido de 7 a 9 digitos, y pulsa `Aceptar y votar`.
3. Selecciona una lista o `Voto en blanco`.
4. Pulsa `Confirmar voto`.
5. Acepta la confirmacion.
6. Verifica el mensaje de exito.
7. Regresa al inicio para habilitar al siguiente alumno con otro documento.
8. Entra a `/dashboard` para ver los resultados actualizados.
9. Para acceder al panel, entra por `/admin/login` y usa las credenciales de `.env.local`.
10. Desde `/dashboard` puedes abrir/cerrar, exportar o reiniciar la votacion.

## Decisiones de arquitectura

- La insercion de votos se hace en `POST /api/votes`.
- La habilitacion por documento se hace en `POST /api/voter-access` y valida el padron `eligible_voters`.
- Las consultas del dashboard se concentran en `src/services/votes.js`.
- La configuracion de eleccion se separa en `election_settings` para poder abrir o cerrar la votacion.
- El control de duplicidad se resuelve con `voter_access` y la columna unica `votes.student_dni` (documento del alumno).
- El dashboard usa credenciales simples por cookie `httpOnly`, sin depender aun de Supabase Auth.
- El Flash Electoral reutiliza la misma sesion administrativa del dashboard.
- Si luego quieres escalar, puedes migrar esta capa a Supabase Auth sin reestructurar la app.

## Notas sobre Supabase

El SQL incluido crea politicas RLS abiertas para `anon` porque el sistema, por ahora, no usa login. Eso hace posible:

- leer listas activas
- leer configuracion del proceso
- registrar/consultar accesos por documento
- insertar votos
- leer votos para el dashboard

Cuando agregues autenticacion admin, lo correcto es restringir la lectura de votos y la administracion del proceso a usuarios autenticados con permisos administrativos.

La tabla `eligible_voters` no tiene politicas publicas para proteger el padron de DNIs. La app la
consulta desde el servidor usando `SUPABASE_SERVICE_ROLE_KEY`.

## Cargar padron de DNI por mesa

Ejecuta `supabase/migrate_eligible_voters.sql` si tu base ya existe. Luego importa un CSV en la tabla
`eligible_voters` desde Supabase. Puedes usar `supabase/eligible_voters_template.csv` como plantilla:

```csv
dni,mesa_numero,mesa_aula,student_name
12345678,1,1AS,Alumno 1
87654321,2,1BS,Alumno 2
```

`student_name` es opcional. `mesa_aula` debe coincidir con una de estas opciones: `1AS`, `1BS`,
`2AS`, `2BS`, `3AS`, `3BS`, `4TO`, `5TO`.

Si un DNI existe en el padron pero intenta ingresar por otra mesa, el sistema bloquea el acceso antes
de llegar a la pantalla de voto.

## Activar auditoria en instalaciones existentes

Si ya tenias la base creada antes de agregar auditoria, ejecuta este SQL en Supabase:

```sql
create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_username text not null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists admin_audit_logs_created_at_idx
on admin_audit_logs(created_at desc);

create index if not exists admin_audit_logs_action_idx
on admin_audit_logs(action);

alter table admin_audit_logs enable row level security;
```

## Migrar instalaciones existentes al flujo por documento

Si ya tienes la base creada y no quieres perder datos, ejecuta:

```sql
-- Archivo incluido en el proyecto:
-- supabase/migrate_dni_access.sql
```

Ese script:
- crea `voter_access`
- agrega `votes.student_dni`
- rellena documentos sintéticos para votos antiguos (solo para mantener compatibilidad)
- activa restricciones y políticas necesarias para bloquear duplicidad de voto por documento

## Actualizar a 2 listas oficiales

Si ya tienes una base en uso y quieres quedarte solo con dos listas:

```sql
-- Archivo incluido en el proyecto:
-- supabase/migrate_two_committees.sql
```

Listas configuradas:
- `Lista N° 1 - Maria Luisa Oliva Vásquez` (sigla `LD`, foto `public/Candidata 1.webp`)
- `Lista N° 2 - Sol De María Anticona Gutiérrez` (sigla `ELUN`, foto `public/Candidata 2.webp`)

## Cargar 500 datos aleatorios

Para pruebas visuales (dashboard/flash), ejecuta en Supabase:

```sql
-- Archivo incluido en el proyecto:
-- supabase/seed_500_random_votes.sql
```

Ese script inserta 500 registros nuevos en `voter_access` y `votes` con distribución aleatoria.
