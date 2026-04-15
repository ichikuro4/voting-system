import Image from "next/image";
import FlashAutoRefresh from "@/components/FlashAutoRefresh";
import {
  getCandidateDisplayName,
  getCommitteeVisualData,
  getListDisplayName,
} from "@/lib/committee-visuals";
import { getElectionSettings } from "@/services/election";
import { getVotingResults } from "@/services/votes";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Flash Electoral | Brüning School",
};

export default async function FlashElectoralPage() {
  const [results, settings] = await Promise.all([getVotingResults(), getElectionSettings()]);
  const activeCommittees = results.resultsByCommittee.filter((committee) => committee.active);

  return (
    <section className="space-y-6">
      <div className="panel rounded-[2rem] p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-800">
          Elecciones del colegio Brüning School
        </p>
        <h1 className="mt-4 font-serif text-4xl font-bold text-slate-950 sm:text-5xl">
          Flash Electoral
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg">
          Visualización en tiempo real del porcentaje por lista.
        </p>
        <FlashAutoRefresh />

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
            {settings.process_name}
          </span>
          <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Total de votos: {results.totalVotes}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {activeCommittees.map((committee) => {
          const visualData = getCommitteeVisualData(committee.name);
          const listDisplayName = getListDisplayName(committee.name);
          const candidateDisplayName = getCandidateDisplayName(committee.name);

          return (
            <article
              key={committee.id}
              className="panel-strong rounded-[2rem] border border-slate-200 p-5 sm:p-6"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_3.2rem] gap-3">
                <div className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-slate-100">
                  {visualData.imageSrc ? (
                    <Image
                      src={visualData.imageSrc}
                      alt={`Foto de ${candidateDisplayName || committee.name}`}
                      width={800}
                      height={1200}
                      className="h-[26rem] w-full object-contain object-center"
                    />
                  ) : (
                    <div className="flex h-[26rem] items-center justify-center px-5 text-center text-sm font-semibold text-slate-500">
                      Sin foto disponible
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center rounded-[1.1rem] bg-slate-900 px-2 py-3 text-white">
                  <p
                    className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/90"
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      transform: "rotate(180deg)",
                    }}
                  >
                    {candidateDisplayName || committee.name}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    {listDisplayName || "Lista"}
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-950">
                    {visualData.logoLabel || "LISTA"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Porcentaje
                  </p>
                  <p className="mt-1 text-4xl font-black text-slate-950">{committee.percentage}%</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
