"use client";

import dynamic from "next/dynamic";

const ResultsChart = dynamic(() => import("@/components/ResultsChart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
      Cargando grafica...
    </div>
  ),
});

export default function ResultsChartClient({ data }) {
  return <ResultsChart data={data} />;
}
