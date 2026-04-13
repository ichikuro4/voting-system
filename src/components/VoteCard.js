function getInitials(title, isBlank) {
  if (isBlank) {
    return "VB";
  }

  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
}

function getCoverStyle(color, isBlank) {
  const baseColor = isBlank ? "#64748b" : color || "#0f766e";

  return {
    backgroundImage: `
      radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.42), transparent 28%),
      radial-gradient(circle at 82% 18%, rgba(255, 255, 255, 0.24), transparent 22%),
      linear-gradient(135deg, ${baseColor} 0%, #0f172a 125%)
    `,
  };
}

export default function VoteCard({
  value,
  title,
  description,
  selected,
  onChange,
  color,
  isBlank = false,
}) {
  const initials = getInitials(title, isBlank);
  const coverStyle = getCoverStyle(color, isBlank);

  return (
    <label
      className={`group block cursor-pointer overflow-hidden rounded-[1.75rem] border p-4 transition duration-200 ${
        selected
          ? "border-slate-900 bg-slate-950 text-white shadow-[0_24px_55px_rgba(15,23,42,0.22)]"
          : "border-slate-200 bg-white text-slate-900 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_22px_45px_rgba(15,23,42,0.12)]"
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

      <div className="relative overflow-hidden rounded-[1.35rem] p-5" style={coverStyle}>
        <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10 blur-sm" />
        <div className="absolute -bottom-8 right-6 h-20 w-20 rounded-full border border-white/20 bg-white/10" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
              {isBlank ? "Opcion especial" : "Comite activo"}
            </p>
            <div className="mt-4 inline-flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-[1.1rem] border border-white/20 bg-white/[0.14] text-2xl font-black text-white backdrop-blur-sm">
              {initials}
            </div>
          </div>

          <span
            aria-hidden="true"
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
              selected ? "border-white/40 bg-white/[0.18]" : "border-white/25 bg-black/10"
            }`}
          >
            <span
              className={`h-3 w-3 rounded-full transition ${
                selected ? "bg-white" : "bg-transparent"
              }`}
            />
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3 px-1 pb-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold">{title}</h3>
              {isBlank ? (
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                    selected ? "bg-white/[0.12] text-white/80" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Blanco
                </span>
              ) : null}
            </div>
            <p
              className={`mt-2 text-sm leading-6 ${
                selected ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {description}
            </p>
          </div>

          <span
            className={`mt-1 inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
              selected
                ? "bg-white/[0.12] text-white/80"
                : "border border-slate-200 bg-slate-50 text-slate-500"
            }`}
          >
            {selected ? "Elegido" : "Disponible"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-3.5 w-3.5 rounded-full border ${
                selected ? "border-white/30" : "border-slate-200"
              }`}
              style={{ backgroundColor: color }}
            />
            <span className={`text-xs font-semibold ${selected ? "text-slate-300" : "text-slate-500"}`}>
              {isBlank ? "Sin preferencia" : "Toca para seleccionar"}
            </span>
          </div>
          <span className={`text-sm font-semibold ${selected ? "text-white" : "text-slate-700"}`}>
            {selected ? "Listo para confirmar" : "Elegir"}
          </span>
        </div>
      </div>
    </label>
  );
}
