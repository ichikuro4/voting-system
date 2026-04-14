# Sistema de Votacion Escolar

Aplicacion web de votacion escolar construida con:

- Next.js con App Router
- JavaScript puro
- Supabase como base de datos
- Tailwind CSS para estilos
- Recharts para el dashboard

La app permite:

- votar por un comite activo
- registrar voto en blanco
- confirmar antes de guardar
- reiniciar la pantalla para el siguiente alumno
- ver resultados en un dashboard con porcentajes y grafica
- proteger el dashboard con credenciales administrativas

## Estructura

```text
src/
  app/
    admin/login/page.js
    api/admin/login/route.js
    api/admin/logout/route.js
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
    votes.js
supabase/
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

1. Entra a `/votar`.
2. Selecciona un comite o `Voto en blanco`.
3. Pulsa `Confirmar voto`.
4. Acepta la confirmacion.
5. Verifica el mensaje de exito.
6. Pulsa `Reiniciar pantalla` para dejar la vista lista para el siguiente alumno.
7. Entra a `/dashboard` para ver los resultados actualizados.
8. Para acceder al panel, entra por `/admin/login` y usa las credenciales de `.env.local`.

## Decisiones de arquitectura

- La insercion de votos se hace en `POST /api/votes`.
- Las consultas del dashboard se concentran en `src/services/votes.js`.
- La configuracion de eleccion se separa en `election_settings` para poder abrir o cerrar la votacion.
- El dashboard usa credenciales simples por cookie `httpOnly`, sin depender aun de Supabase Auth.
- Si luego quieres escalar, puedes migrar esta capa a Supabase Auth sin reestructurar la app.

## Notas sobre Supabase

El SQL incluido crea politicas RLS abiertas para `anon` porque el sistema, por ahora, no usa login. Eso hace posible:

- leer comites activos
- leer configuracion del proceso
- insertar votos
- leer votos para el dashboard

Cuando agregues autenticacion admin, lo correcto es restringir la lectura de votos y la administracion del proceso a usuarios autenticados con permisos administrativos.
