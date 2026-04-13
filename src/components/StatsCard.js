const accents = {
  sky: "bg-sky-50 text-sky-900",
  amber: "bg-amber-50 text-amber-900",
  teal: "bg-teal-50 text-teal-900",
  rose: "bg-rose-50 text-rose-900",
};

export default function StatsCard({ title, value, description, accent = "sky" }) {
  return (
    <article className="panel-strong rounded-[1.5rem] p-5">
      <div
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
          accents[accent] || accents.sky
        }`}
      >
        {title}
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
