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

function getDeterministicSeed(value) {
  return value.split("").reduce((accumulator, character) => {
    return (accumulator * 31 + character.charCodeAt(0)) >>> 0;
  }, 17);
}

function getLogoPalette(seed, isBlank) {
  if (isBlank) {
    return {
      start: "#475569",
      end: "#0f172a",
      accent: "rgba(255,255,255,0.72)",
    };
  }

  const palettes = [
    { start: "#0f172a", end: "#1d4ed8", accent: "rgba(255,255,255,0.8)" },
    { start: "#1f2937", end: "#0369a1", accent: "rgba(255,255,255,0.78)" },
    { start: "#334155", end: "#0f766e", accent: "rgba(255,255,255,0.76)" },
    { start: "#111827", end: "#7c3aed", accent: "rgba(255,255,255,0.8)" },
    { start: "#1e293b", end: "#b45309", accent: "rgba(255,255,255,0.78)" },
  ];

  return palettes[seed % palettes.length];
}

function getLogoSerial(seed) {
  return String((seed % 900) + 100);
}

function renderLogoPattern(variant, accentColor) {
  if (variant === 0) {
    return (
      <>
        <span
          aria-hidden="true"
          className="absolute inset-2 rounded-full border-2"
          style={{ borderColor: accentColor }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-5 rounded-full border"
          style={{ borderColor: accentColor }}
        />
      </>
    );
  }

  if (variant === 1) {
    return (
      <>
        <span
          aria-hidden="true"
          className="absolute left-2 right-2 top-1/2 h-1.5 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-y-2 left-1/2 w-1.5 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      </>
    );
  }

  if (variant === 2) {
    return (
      <>
        <span
          aria-hidden="true"
          className="absolute left-2 right-2 top-2 h-2 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <span
          aria-hidden="true"
          className="absolute bottom-2 left-2 right-2 h-2 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <span
          aria-hidden="true"
          className="absolute bottom-5 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border-2"
          style={{ borderColor: accentColor }}
        />
      </>
    );
  }

  return (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-2 rounded-xl border-2"
        style={{ borderColor: accentColor }}
      />
      <span
        aria-hidden="true"
        className="absolute left-3 right-3 top-3 h-2 rounded-full"
        style={{ backgroundColor: accentColor }}
      />
      <span
        aria-hidden="true"
        className="absolute bottom-3 left-3 right-3 h-2 rounded-full"
        style={{ backgroundColor: accentColor }}
      />
    </>
  );
}

export default function VoteCard({
  value,
  title,
  candidateName,
  description,
  selected,
  onChange,
  color,
  isBlank = false,
}) {
  const initials = getInitials(title, isBlank);
  const coverStyle = getCoverStyle(color, isBlank);
  const seed = getDeterministicSeed(value || title);
  const logoPalette = getLogoPalette(seed, isBlank);
  const logoVariant = seed % 4;
  const logoSerial = getLogoSerial(seed);

  return (
    <label
      className={`group relative block cursor-pointer overflow-hidden rounded-[1.75rem] border p-4 transition duration-200 ${
        selected
          ? "border-slate-900 bg-slate-50 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.14)]"
          : "border-slate-200 bg-white text-slate-900 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]"
      }`}
    >
      <input
        type="radio"
        name="committee"
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="peer sr-only"
        aria-label={`Seleccionar ${title}`}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-2 ring-sky-500/80 opacity-0 transition peer-focus-visible:opacity-100"
      />

      <div className="relative overflow-hidden rounded-[1.35rem] p-5" style={coverStyle}>
        <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/10 blur-sm" />
        <div className="absolute -bottom-8 right-6 h-20 w-20 rounded-full border border-white/20 bg-white/10" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
              {isBlank ? "Opción especial" : "Lista oficial"}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/90">
              Cartilla de votación oficial.
            </p>
          </div>

          <span
            aria-hidden="true"
            className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.45rem] border-2 transition ${
              selected ? "border-white/70 bg-white/[0.18]" : "border-white/35 bg-black/10"
            }`}
          >
            <span
              className={`absolute left-1.5 right-1.5 top-1/2 h-[2px] -translate-y-1/2 rotate-45 rounded-full bg-white transition ${
                selected ? "opacity-100" : "opacity-0"
              }`}
            />
            <span
              className={`absolute left-1.5 right-1.5 top-1/2 h-[2px] -translate-y-1/2 -rotate-45 rounded-full bg-white transition ${
                selected ? "opacity-100" : "opacity-0"
              }`}
            />
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3 px-1 pb-1">
        <div className="flex items-center gap-4 rounded-[1.1rem] border border-slate-200 bg-slate-50/80 p-3.5">
          <div
            className="relative flex h-[4.8rem] w-[4.8rem] shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-white/30 shadow-sm"
            style={{
              backgroundImage: `linear-gradient(145deg, ${logoPalette.start}, ${logoPalette.end})`,
            }}
          >
            {renderLogoPattern(logoVariant, logoPalette.accent)}
            <span className="relative z-10 text-[13px] font-black uppercase tracking-[0.14em] text-white">
              {initials}
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {isBlank ? "Código especial" : "Símbolo de lista"}
            </p>
            <p className="mt-1 truncate text-base font-bold text-slate-950">{title}</p>
            {candidateName ? (
              <p className="mt-1 text-sm text-slate-600">Personería: {candidateName}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-slate-200/90 pt-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-3.5 w-3.5 rounded-full border ${
                selected ? "border-slate-700" : "border-slate-200"
              }`}
              style={{ backgroundColor: color }}
            />
            <span className="text-xs font-semibold text-slate-600">
              {description || (isBlank ? "Sin preferencia de lista" : "Marca una sola opción")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {selected ? "Seleccionado" : "Disponible"}
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Cod. {logoSerial}
            </span>
          </div>
        </div>
      </div>
    </label>
  );
}
