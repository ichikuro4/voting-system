import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function Home() {
  const configured = isSupabaseConfigured();

  return (
    <section className="space-y-8">
      <div className="panel rounded-[2rem] p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-800">
              Eleccion Escolar
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-serif text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Sistema web de votacion escolar con registro simple y dashboard en tiempo real.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">
                La aplicacion permite votar por un comite, registrar voto en blanco y consultar resultados
                desde un panel administrativo conectado a Supabase.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/votar"
                className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Ir a votar
              </Link>
              <Link
                href="/admin/login"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Ver dashboard
              </Link>
            </div>
          </div>

          <div className="panel-strong rounded-[1.75rem] p-6">
            <h2 className="text-lg font-bold text-slate-950">Estado de configuracion</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Stack</p>
                <p>Next.js App Router, JavaScript, Tailwind CSS, Supabase y Recharts.</p>
              </div>
              <div
                className={`rounded-2xl p-4 ${
                  configured
                    ? "bg-emerald-50 text-emerald-900"
                    : "bg-amber-50 text-amber-900"
                }`}
              >
                <p className="font-semibold">
                  {configured ? "Supabase configurado" : "Falta configurar Supabase"}
                </p>
                <p>
                  {configured
                    ? "La app ya puede consultar comites y votos desde la base de datos."
                    : "Completa `.env.local` con tus credenciales y ejecuta el SQL incluido en `supabase/schema.sql`."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <article className="panel-strong rounded-[1.5rem] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Paso 1</p>
          <h2 className="mt-3 text-xl font-bold text-slate-950">Preparar comites</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Registra los comites activos con nombre, descripcion corta y color para mostrarlos en la
            pantalla de votacion y en el dashboard.
          </p>
        </article>

        <article className="panel-strong rounded-[1.5rem] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Paso 2</p>
          <h2 className="mt-3 text-xl font-bold text-slate-950">Emitir votos</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Cada alumno selecciona una unica opcion, confirma su decision y el sistema queda listo para
            el siguiente voto.
          </p>
        </article>

        <article className="panel-strong rounded-[1.5rem] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Paso 3</p>
          <h2 className="mt-3 text-xl font-bold text-slate-950">Revisar resultados</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            El dashboard resume el total de votos, votos en blanco, porcentajes por comite y el lider
            actual del proceso electoral.
          </p>
        </article>
      </div>
    </section>
  );
}
