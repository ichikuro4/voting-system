import AdminLogoutButton from "@/components/AdminLogoutButton";
import ResultsChartClient from "@/components/ResultsChartClient";
import StatsCard from "@/components/StatsCard";
import { requireAdminSession } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getElectionSettings } from "@/services/election";
import { getVotingResults } from "@/services/votes";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard | Sistema de Votacion Escolar",
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
        <h1 className="font-serif text-3xl font-bold text-slate-950">Dashboard de resultados</h1>
        <p className="mt-4 max-w-2xl text-slate-700">
          Configura las variables de entorno y la base de datos en Supabase para habilitar el panel.
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
      <div className="panel rounded-[2rem] p-8 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-800">
              Dashboard administrativo
            </p>
            <h1 className="font-serif text-4xl font-bold text-slate-950">Resultados del proceso</h1>
            <p className="max-w-2xl text-base leading-7 text-slate-700">
              Consulta el avance de la eleccion, el total de votos emitidos y el comportamiento por
              comite desde un panel protegido con credenciales administrativas simples.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`rounded-2xl px-5 py-4 text-sm font-semibold ${
                settings.is_open
                  ? "bg-emerald-50 text-emerald-900"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {settings.is_open ? "Votacion abierta" : "Votacion cerrada"}
            </div>
            <AdminLogoutButton />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total de votos"
          value={results.totalVotes}
          accent="sky"
          description="Votos registrados en Supabase"
        />
        <StatsCard
          title="Votos en blanco"
          value={results.blankVotes}
          accent="amber"
          description={`${results.blankPercentage}% del total`}
        />
        <StatsCard
          title="Comites activos"
          value={results.resultsByCommittee.filter((item) => item.active).length}
          accent="teal"
          description="Opciones disponibles en votacion"
        />
        <StatsCard
          title="Va ganando"
          value={leaderLabel}
          accent="rose"
          description="Lider actual segun votos emitidos"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="panel-strong rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Grafica de resultados</h2>
              <p className="mt-2 text-sm text-slate-600">
                Distribucion de votos por comite y voto en blanco.
              </p>
            </div>
          </div>

          <div className="mt-6 h-[360px]">
            <ResultsChartClient data={results.chartData} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel-strong rounded-[1.75rem] p-6">
            <h2 className="text-xl font-bold text-slate-950">Resumen</h2>
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

          <div className="panel-strong rounded-[1.75rem] p-6">
            <h2 className="text-xl font-bold text-slate-950">Consideraciones</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
              <li>El dashboard consulta directamente Supabase cada vez que se abre esta pagina.</li>
              <li>La insercion de votos sigue aislada en la ruta `POST /api/votes`.</li>
              <li>Mas adelante puedes reemplazar este login simple por Supabase Auth o middleware admin.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
