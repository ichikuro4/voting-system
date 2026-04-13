import VoteForm from "@/components/VoteForm";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getActiveCommittees } from "@/services/committees";
import { getElectionSettings } from "@/services/election";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Votar | Sistema de Votacion Escolar",
};

export default async function VotePage() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="panel rounded-[2rem] p-8">
        <h1 className="font-serif text-3xl font-bold text-slate-950">Pantalla de votacion</h1>
        <p className="mt-4 max-w-2xl text-slate-700">
          Antes de usar esta pagina debes configurar Supabase en `.env.local` y ejecutar el archivo
          `supabase/schema.sql`.
        </p>
      </section>
    );
  }

  const [committees, settings] = await Promise.all([
    getActiveCommittees(),
    getElectionSettings(),
  ]);

  return (
    <section className="space-y-6">
      <div className="panel rounded-[2rem] p-8 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-800">
              Mesa de votacion
            </p>
            <h1 className="font-serif text-4xl font-bold text-slate-950">Emision de voto</h1>
            <p className="max-w-2xl text-base leading-7 text-slate-700">
              Selecciona un comite o la opcion de voto en blanco. El sistema registra un voto por envio
              y luego puede reiniciarse para el siguiente alumno.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Proceso actual
              </p>
              <p className="mt-2 text-lg font-bold text-slate-950">
                {settings.process_name || "Proceso electoral escolar"}
              </p>
            </div>
            <div
              className={`rounded-2xl p-4 ${
                settings.is_open
                  ? "bg-emerald-50 text-emerald-900"
                  : "bg-rose-50 text-rose-900"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Estado</p>
              <p className="mt-2 text-lg font-bold">
                {settings.is_open ? "Votacion abierta" : "Votacion cerrada"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <VoteForm
        committees={committees}
        processName={settings.process_name}
        votingOpen={settings.is_open}
      />
    </section>
  );
}
