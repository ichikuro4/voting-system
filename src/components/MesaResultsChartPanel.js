"use client";

import { useMemo, useState } from "react";
import ResultsChartClient from "@/components/ResultsChartClient";

export default function MesaResultsChartPanel({ mesaBreakdown = [] }) {
  const [selectedMesaNumero, setSelectedMesaNumero] = useState(
    mesaBreakdown[0] ? String(mesaBreakdown[0].mesaNumero) : ""
  );

  const selectedMesa = useMemo(
    () => mesaBreakdown.find((mesa) => String(mesa.mesaNumero) === selectedMesaNumero) || null,
    [mesaBreakdown, selectedMesaNumero]
  );

  if (!mesaBreakdown.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        Aún no hay datos por mesa para mostrar.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Gráfica por mesa</h2>
          <p className="mt-2 text-sm text-slate-600">
            Selecciona una mesa para ver su distribución de votos por opción.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <label
            htmlFor="mesa-selector"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
          >
            Seleccionar mesa
          </label>
          <select
            id="mesa-selector"
            value={selectedMesaNumero}
            onChange={(event) => setSelectedMesaNumero(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            {mesaBreakdown.map((mesa) => (
              <option key={mesa.mesaNumero} value={String(mesa.mesaNumero)}>
                Mesa {mesa.mesaNumero} - {mesa.mesaAula}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800">
          Total en mesa: {selectedMesa?.votes ?? 0}
        </span>
        <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Blancos en mesa: {selectedMesa?.blankVotes ?? 0}
        </span>
      </div>

      <div className="mt-6 h-[340px]">
        <ResultsChartClient data={selectedMesa?.chartData || []} />
      </div>
    </div>
  );
}
