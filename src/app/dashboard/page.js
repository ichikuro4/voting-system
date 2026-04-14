import AdminLogoutButton from "@/components/AdminLogoutButton";
import ElectionStatusToggleButton from "@/components/ElectionStatusToggleButton";
import ExportVotesButton from "@/components/ExportVotesButton";
import ResetVotesButton from "@/components/ResetVotesButton";
import ResultsChartClient from "@/components/ResultsChartClient";
import StatsCard from "@/components/StatsCard";
import { requireAdminSession } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getElectionSettings } from "@/services/election";
import { getVotingResults } from "@/services/votes";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Resultados | Brüning School",
};

function buildLeaderLabel(leaders) {
  if (!leaders.length) {
    return "Sin votos registrados";
  }

  if (leaders.length === 1) {
    return leaders[0].name;
  }

  return `Empate entre ${leaders.map((leader) => leader.name).join(", ")}`;
}

export default async function DashboardPage() {
  await requireAdminSession();

  if (!isSupabaseConfigured()) {
    return (
      <section className="panel rounded-[2rem] p-8">
        <h1 className="font-serif text-3xl font-bold text-slate-950">Panel de resultados</h1>
        <p className="mt-4 max-w-2xl text-slate-700">
          El panel no está disponible en este momento. Contacta al soporte del sistema.
        </p>
      </section>
    );
  }

  const [results, settings] = await Promise.all([
    getVotingResults(),
    getElectionSettings(),
  ]);

  const leaderLabel = buildLeaderLabel(results.leaders);

  return (
    <section className="space-y-6">
      <div className="panel space-y-6 rounded-[2rem] p-8 sm:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-800">
              Elecciones del colegio Brüning School
            </p>
            <h1 className="font-serif text-4xl font-bold text-slate-950">Resultados de la votación</h1>
            <p className="max-w-2xl text-base leading-7 text-slate-700">
              Consulta el total de votos, el estado de la jornada y la distribución por comité.
            </p>
          </div>
          <div
            className={`w-fit rounded-2xl px-5 py-4 text-sm font-semibold ${
              settings.is_open
                ? "bg-emerald-50 text-emerald-900"
                : "bg-slate-100 text-slate-800"
            }`}
          >
            {settings.is_open ? "Votación abierta" : "Votación cerrada"}
          </div>
        </div>

        <div className="grid items-stretch gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ElectionStatusToggleButton isOpen={settings.is_open} />
          <ResetVotesButton />
          <ExportVotesButton />
          <AdminLogoutButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total de votos"
          value={results.totalVotes}
          accent="sky"
          description="Votos registrados"
        />
        <StatsCard
          title="Votos en blanco"
          value={results.blankVotes}
          accent="amber"
          description={`${results.blankPercentage}% del total`}
        />
        <StatsCard
          title="Comités activos"
          value={results.resultsByCommittee.filter((item) => item.active).length}
          accent="teal"
          description="Opciones disponibles"
        />
        <StatsCard
          title="Va ganando"
          value={leaderLabel}
          accent="rose"
          description="Líder actual según votos emitidos"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="panel-strong rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Gráfica de resultados</h2>
              <p className="mt-2 text-sm text-slate-600">
                Distribución de votos por comité y voto en blanco.
              </p>
            </div>
          </div>

          <div className="mt-6 h-[360px]">
            <ResultsChartClient data={results.chartData} />
          </div>
        </div>

        <div className="panel-strong rounded-[1.75rem] p-6">
          <h2 className="text-xl font-bold text-slate-950">Resumen por opción</h2>
          <p className="mt-2 text-sm text-slate-600">{settings.process_name}</p>
          <div className="mt-5 space-y-3">
            {results.resultsByCommittee.map((committee) => (
              <div
                key={committee.id}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: committee.color }}
                    />
                    <p className="font-semibold text-slate-900">{committee.name}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{committee.votes} votos</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{committee.percentage}% del total</p>
              </div>
            ))}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">Voto en blanco</p>
                <p className="text-sm font-bold text-slate-900">{results.blankVotes} votos</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">{results.blankPercentage}% del total</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
