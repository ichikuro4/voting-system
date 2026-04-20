import AdminLogoutButton from "@/components/AdminLogoutButton";
import ElectionStatusToggleButton from "@/components/ElectionStatusToggleButton";
import ExportVotesButton from "@/components/ExportVotesButton";
import MesaResultsChartPanel from "@/components/MesaResultsChartPanel";
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

function getProgressWidth(percentage) {
  const numericPercentage = Number(percentage);

  if (Number.isNaN(numericPercentage)) {
    return "0%";
  }

  return `${Math.min(100, Math.max(0, numericPercentage))}%`;
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

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
              {settings.process_name || "Elecciones del colegio Brüning School"}
            </span>
            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                settings.is_open ? "bg-emerald-50 text-emerald-900" : "bg-slate-100 text-slate-800"
              }`}
            >
              {settings.is_open ? "Votación abierta" : "Votación cerrada"}
            </span>
          </div>
        </div>
      </div>

      <div className="panel-strong rounded-[1.75rem] p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Acciones administrativas</h2>
            <p className="mt-1 text-sm text-slate-600">
              Gestiona el estado de la jornada y descarga respaldos sin salir de esta vista.
            </p>
          </div>
        </div>

        <div className="mt-5 grid items-stretch gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ElectionStatusToggleButton isOpen={settings.is_open} />
          <ResetVotesButton />
          <ExportVotesButton />
          <AdminLogoutButton />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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

      <div className="panel-strong rounded-[1.75rem] p-6">
        <h2 className="text-xl font-bold text-slate-950">Votos por mesa</h2>
        <p className="mt-2 text-sm text-slate-600">
          Distribución total de votos registrados por mesa.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {results.votesByMesa.map((mesa) => (
            <div
              key={mesa.mesaNumero}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Mesa {mesa.mesaNumero}
              </p>
              <p className="mt-2 text-lg font-bold text-slate-950">{mesa.mesaAula}</p>
              <p className="mt-1 text-sm text-slate-700">{mesa.votes} votos</p>
            </div>
          ))}
        </div>
        {results.votesWithoutMesa > 0 ? (
          <p className="mt-4 text-sm text-amber-800">
            Hay {results.votesWithoutMesa} voto(s) sin mesa asignada en registros históricos.
          </p>
        ) : null}
      </div>

      <div className="panel-strong rounded-[1.75rem] p-6">
        <MesaResultsChartPanel mesaBreakdown={results.mesaBreakdown} />
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

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: committee.color,
                      width: getProgressWidth(committee.percentage),
                    }}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-600">{committee.percentage}% del total</p>
              </div>
            ))}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">Voto en blanco</p>
                <p className="text-sm font-bold text-slate-900">{results.blankVotes} votos</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-500"
                  style={{ width: getProgressWidth(results.blankPercentage) }}
                />
              </div>
              <p className="mt-2 text-sm text-slate-600">{results.blankPercentage}% del total</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
