"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_18px_35px_rgba(15,23,42,0.12)]">
      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
      <p className="mt-1 text-sm text-slate-700">
        <span className="font-bold text-slate-900">{item.votes}</span> votos
      </p>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {item.percentage}% del total
      </p>
    </div>
  );
}

export default function ResultsChart({ data }) {
  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        Aún no hay datos para mostrar en la gráfica.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barCategoryGap={20} margin={{ top: 8, right: 12, left: -6, bottom: 12 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#d8e0ea" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#607084"
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-8}
          textAnchor="end"
          tick={{ fontSize: 12, fontWeight: 600 }}
          tickMargin={10}
          height={66}
        />
        <YAxis
          allowDecimals={false}
          stroke="#607084"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          width={34}
        />
        <Tooltip
          cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
          content={<ChartTooltip />}
        />
        <Bar dataKey="votes" radius={[12, 12, 0, 0]} maxBarSize={56}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
