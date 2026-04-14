const accents = {
  sky: {
    badge: "bg-sky-50 text-sky-900",
    bar: "bg-sky-500",
  },
  amber: {
    badge: "bg-amber-50 text-amber-900",
    bar: "bg-amber-500",
  },
  teal: {
    badge: "bg-teal-50 text-teal-900",
    bar: "bg-teal-500",
  },
  rose: {
    badge: "bg-rose-50 text-rose-900",
    bar: "bg-rose-500",
  },
};

export default function StatsCard({ title, value, description, accent = "sky" }) {
  const tone = accents[accent] || accents.sky;

  return (
    <article className="panel-strong rounded-[1.5rem] p-5">
      <div className={`h-1.5 w-14 rounded-full ${tone.bar}`} />
      <div
        className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${tone.badge}`}
      >
        {title}
      </div>
      <p className="mt-4 text-3xl font-bold leading-tight text-slate-950 [text-wrap:balance]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
