import Image from "next/image";

function getInitials(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
}

export default function VoteCard({
  value,
  title,
  candidateName,
  logoLabel,
  candidateImageSrc,
  selected,
  onChange,
  color,
}) {
  const logoInitials = logoLabel || getInitials(title) || "LP";
  const personInitials = getInitials(candidateName || title) || "PE";

  return (
    <label
      className={`group relative block cursor-pointer overflow-hidden rounded-[1.4rem] border p-4 transition-all duration-200 ease-out will-change-transform ${
        selected
          ? "scale-[1.02] border-slate-900 bg-slate-50 shadow-[0_20px_36px_rgba(15,23,42,0.16)]"
          : "scale-100 border-slate-200 bg-white hover:scale-[1.01] hover:border-slate-300 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
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
        className="pointer-events-none absolute inset-0 rounded-[1.4rem] ring-2 ring-sky-500/80 opacity-0 transition peer-focus-visible:opacity-100"
      />

      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <p className="text-base font-black uppercase tracking-[0.04em] text-slate-950">{title}</p>
        <span
          aria-hidden="true"
          className="h-3 w-3 rounded-full border border-slate-200"
          style={{ backgroundColor: color || "#0f766e" }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Logo</p>
          <div className="mt-2 flex aspect-square w-full items-center justify-center rounded-lg border border-slate-200 bg-white">
            <span className="text-2xl font-black uppercase tracking-[0.08em] text-slate-900">
              {logoInitials}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Persona</p>
          <div className="mt-2 aspect-square w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
            {candidateImageSrc ? (
              <div className="relative h-full w-full">
                <Image
                  src={candidateImageSrc}
                  alt={candidateName ? `Foto de ${candidateName}` : `Foto de ${title}`}
                  fill
                  sizes="160px"
                  className="object-cover object-top"
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-2xl font-black uppercase tracking-[0.08em] text-slate-900">
                  {personInitials}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </label>
  );
}
