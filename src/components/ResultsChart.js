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
      <BarChart data={data} barCategoryGap={24}>
        <CartesianGrid strokeDasharray="4 4" stroke="#d8e0ea" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#607084"
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-10}
          textAnchor="end"
          height={64}
        />
        <YAxis allowDecimals={false} stroke="#607084" tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
          }}
          formatter={(value, _name, item) => [
            `${value} votos (${item.payload.percentage}%)`,
            item.payload.name,
          ]}
        />
        <Bar dataKey="votes" radius={[14, 14, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
