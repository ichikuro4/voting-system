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

function getLogoInitials(visualData, listDisplayName, candidateDisplayName, committeeName) {
  if (visualData.logoLabel) {
    return visualData.logoLabel.toUpperCase();
  }

  const baseText = listDisplayName || candidateDisplayName || committeeName;

  return baseText
    .split(/\s+/)
    .map((word) => word.trim().charAt(0))
    .join("")
    .slice(0, 4)
    .toUpperCase();
}

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
          const logoInitials = getLogoInitials(
            visualData,
            listDisplayName,
            candidateDisplayName,
            committee.name
          );

          return (
            <article
              key={committee.id}
              className="panel-strong rounded-[2rem] border border-slate-200 p-5 sm:p-6"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_3.2rem] gap-3">
                <div className="flex h-[26rem] items-center justify-center rounded-[1.4rem] border border-slate-200 bg-gradient-to-b from-slate-100 to-white p-6">
                  <div className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-slate-900 bg-slate-50 shadow-sm sm:h-44 sm:w-44">
                    <p className="text-4xl font-black uppercase tracking-[0.08em] text-slate-900 sm:text-5xl">
                      {logoInitials}
                    </p>
                  </div>
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
                    {logoInitials || "LISTA"}
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
