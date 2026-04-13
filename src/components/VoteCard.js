export default function VoteCard({
  value,
  title,
  description,
  selected,
  onChange,
  color,
  isBlank = false,
}) {
  return (
    <label
      className={`block cursor-pointer rounded-[1.5rem] border p-5 transition ${
        selected
          ? "border-slate-900 bg-slate-900 text-white shadow-lg"
          : "border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:shadow-md"
      }`}
    >
      <input
        type="radio"
        name="committee"
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="sr-only"
      />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex h-4 w-4 rounded-full border border-white/30"
              style={{ backgroundColor: color }}
            />
            <h3 className="text-lg font-bold">{title}</h3>
            {isBlank ? (
              <span
                className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                  selected ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                Blanco
              </span>
            ) : null}
          </div>
          <p className={`text-sm leading-6 ${selected ? "text-slate-200" : "text-slate-600"}`}>
            {description}
          </p>
        </div>

        <span
          aria-hidden="true"
          className={`mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
            selected
              ? "border-white/40 bg-white/15"
              : "border-slate-300 bg-slate-50"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full transition ${
              selected ? "bg-white" : "bg-transparent"
            }`}
          />
        </span>
      </div>
    </label>
  );
}
