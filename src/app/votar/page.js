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
    <section className="space-y-8">
      <div className="panel relative overflow-hidden rounded-[2.4rem] p-8 sm:p-10">
        <div className="absolute left-[-5rem] top-[-5rem] h-36 w-36 rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute right-[-3rem] top-[2rem] h-28 w-28 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-[8rem] h-36 w-36 rounded-full bg-teal-300/25 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)] lg:items-end">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-800">
              Mesa de votacion
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-serif text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Una cabina digital mas clara, vistosa y facil de usar.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
                La pantalla prioriza lectura rapida, seleccion evidente y confirmacion segura para que
                cada alumno pueda votar con menos dudas y menos friccion.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
                {settings.process_name || "Proceso electoral escolar"}
              </span>
              <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                {committees.length + 1} opciones en pantalla
              </span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_24px_55px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Proceso actual
                </p>
                <p className="mt-2 text-lg font-bold text-slate-950">
                  {settings.process_name || "Proceso electoral escolar"}
                </p>
              </div>
              <div
                className={`rounded-[1.5rem] p-4 ${
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

            <div className="mt-4 overflow-hidden rounded-[1.6rem] bg-slate-950 p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                    Experiencia de uso
                  </p>
                  <p className="mt-2 text-xl font-bold">Seleccion visual + confirmacion guiada</p>
                </div>
                <div className="grid gap-2 text-right text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  <span>Rapida</span>
                  <span>Clara</span>
                  <span>Segura</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/[0.08] p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">Paso</p>
                  <p className="mt-2 text-sm font-bold">Elegir</p>
                </div>
                <div className="rounded-2xl bg-white/[0.08] p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">Paso</p>
                  <p className="mt-2 text-sm font-bold">Revisar</p>
                </div>
                <div className="rounded-2xl bg-white/[0.08] p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">Paso</p>
                  <p className="mt-2 text-sm font-bold">Confirmar</p>
                </div>
              </div>
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
