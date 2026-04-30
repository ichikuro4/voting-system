import VoteForm from "@/components/VoteForm";
import { hasAdminSession } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getActiveCommittees } from "@/services/committees";
import { getElectionSettings } from "@/services/election";
import { normalizeDni } from "@/services/voter-access";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Votar | Municipio Escolar",
};

export default async function VotePage({ searchParams }) {
  if (!isSupabaseConfigured()) {
      return (
        <section className="panel rounded-[2rem] p-8">
          <h1 className="font-serif text-3xl font-bold text-slate-950">Pantalla de votación</h1>
          <p className="mt-4 max-w-2xl text-slate-700">
            La plataforma de votación no está disponible en este momento.
          </p>
        </section>
      );
  }
  const resolvedSearchParams = await searchParams;
  const voterDni = normalizeDni(resolvedSearchParams?.dni || "");
  const hasAdminAccess = await hasAdminSession();
  const hasValidDocument = /^\d{7,9}$/.test(voterDni);
  const previewMode = hasAdminAccess && !hasValidDocument;

  if (!hasValidDocument && !hasAdminAccess) {
    return (
      <section className="panel rounded-[2rem] p-8">
        <h1 className="font-serif text-3xl font-bold text-slate-950">Pantalla de votación</h1>
        <p className="mt-4 max-w-2xl text-slate-700">
          Primero debes ingresar tu DNI o carnet de extranjería en la página de inicio para
          habilitar tu voto.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Volver a Inicio
          </Link>
        </div>
      </section>
    );
  }

  const [committees, settings] = await Promise.all([
    getActiveCommittees(),
    getElectionSettings(),
  ]);

  return (
    <section className="space-y-8">
      <div className="panel rounded-[2.4rem] p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)] lg:items-end">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-800">
              Elecciones del Municipio Escolar
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-serif text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Emite tu voto
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
                Selecciona una lista y confirma. Si no eliges ninguna opción, el voto se registrará
                en blanco.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
                {settings.process_name || "Elecciones del Municipio Escolar"}
              </span>
              <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                {committees.length} listas en pantalla
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_24px_55px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <Image
              src="/logo-onpe.webp"
              alt="Logo de la ONPE"
              width={250}
              height={250}
              className="h-auto w-full max-w-[320px] object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {previewMode ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Estás en modo vista administrativa. Puedes revisar la interfaz, pero no registrar votos.
        </div>
      ) : null}

      <VoteForm
        committees={committees}
        processName={settings.process_name}
        votingOpen={settings.is_open}
        voterDni={hasValidDocument ? voterDni : "Vista administrativa"}
        readOnlyPreview={previewMode}
      />
    </section>
  );
}
