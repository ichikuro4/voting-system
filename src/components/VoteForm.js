"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import VoteCard from "@/components/VoteCard";

const blankOptionValue = "blank";
const blankPreview = {
  color: "#94a3b8",
  description: "Registra un voto sin seleccionar un comité.",
  label: "Voto en blanco",
};

function getPreviewStyle(color) {
  const baseColor = color || "#0f766e";

  return {
    backgroundImage: `
      radial-gradient(circle at 22% 20%, rgba(255, 255, 255, 0.45), transparent 28%),
      radial-gradient(circle at 78% 24%, rgba(255, 255, 255, 0.22), transparent 22%),
      linear-gradient(135deg, ${baseColor} 0%, #0f172a 130%)
    `,
  };
}

function getInitials(label) {
  return label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
}

export default function VoteForm({ committees, processName, votingOpen, voterDni }) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const selectedCommitteeRecord = committees.find((committee) => committee.id === selectedOption);

  const selectedLabel =
    selectedOption === blankOptionValue
      ? "Voto en blanco"
      : selectedCommitteeRecord?.name || "";
  const selectedCommittee =
    selectedOption === blankOptionValue
      ? {
          color: blankPreview.color,
          description: blankPreview.description,
          label: blankPreview.label,
        }
      : selectedCommitteeRecord
        ? {
            color: selectedCommitteeRecord.color,
            description:
              selectedCommitteeRecord.short_description ||
              "Comité participante en la elección escolar.",
            label: selectedCommitteeRecord.name || "",
          }
        : null;
  const previewStyle = getPreviewStyle(selectedCommittee?.color || "#0f766e");
  const previewInitials = selectedCommittee ? getInitials(selectedCommittee.label) : "VO";

  useEffect(() => {
    if (!showConfirm) {
      return undefined;
    }

    const previousFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    confirmButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isPending) {
        event.preventDefault();
        setShowConfirm(false);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = dialogRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements.length) {
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusedElement?.focus();
    };
  }, [showConfirm, isPending]);

  function handleSelection(value) {
    setSelectedOption(value);
    setErrorMessage("");
  }

  function handleAskConfirmation(event) {
    event.preventDefault();

    if (!votingOpen) {
      setErrorMessage("La votación está cerrada en este momento.");
      return;
    }

    if (!selectedOption) {
      setErrorMessage("Debes seleccionar un comité o la opción de voto en blanco.");
      return;
    }

    setShowConfirm(true);
  }

  function resetForm() {
    setSelectedOption("");
    setErrorMessage("");
    setShowConfirm(false);
  }

  function handleSubmitVote() {
    setErrorMessage("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/votes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dni: voterDni,
            committeeId: selectedOption === blankOptionValue ? null : selectedOption,
            voteBlank: selectedOption === blankOptionValue,
          }),
        });

        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "No se pudo registrar el voto.");
        }

        setSelectedOption("");
        setShowConfirm(false);
        router.push("/votar/exito");
      } catch (error) {
        setErrorMessage(error.message || "Ocurrió un problema al registrar el voto.");
        setShowConfirm(false);
      }
    });
  }

  function closeConfirmation() {
    if (!isPending) {
      setShowConfirm(false);
    }
  }

  return (
    <>
      <section className="panel-strong overflow-hidden rounded-[2.25rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
              Boleta digital
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Selecciona tu opción de voto
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              {processName || "Elecciones del colegio Brüning School"}. Selecciona una tarjeta, revisa
              la elección y confirma.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[24rem]">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Opciones
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{committees.length + 1}</p>
              <p className="mt-1">Incluye voto en blanco.</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Documento habilitado
              </p>
              <p className="mt-2 text-base font-bold text-slate-950">{voterDni}</p>
              <p className="mt-1">Solo se admite un voto por documento.</p>
            </div>
          </div>
        </div>

        {!votingOpen ? (
          <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-rose-900">
            La votación está cerrada en este momento. Consulta al responsable de mesa.
          </div>
        ) : null}

        <form onSubmit={handleAskConfirmation} className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          {errorMessage ? (
            <div
              role="alert"
              className="xl:col-span-2 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
            >
              {errorMessage}
            </div>
          ) : null}

          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-800">
                Paso 1
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
                Selecciona una opción
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                Una opción por envío
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {committees.map((committee) => (
                <VoteCard
                  key={committee.id}
                  value={committee.id}
                  title={committee.name}
                  description={
                    committee.short_description || "Comité participante en la elección escolar."
                  }
                  color={committee.color}
                  selected={selectedOption === committee.id}
                  onChange={handleSelection}
                />
              ))}

              <VoteCard
                value={blankOptionValue}
                title="Voto en blanco"
                description={blankPreview.description}
                color={blankPreview.color}
                isBlank
                selected={selectedOption === blankOptionValue}
                onChange={handleSelection}
              />
            </div>
          </div>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <div className="overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white shadow-[0_22px_50px_rgba(15,23,42,0.08)]">
              <div className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                  Paso 2
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  Revisa tu selección
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Verifica esta información antes de confirmar.
                </p>
              </div>

              <div className="mx-5 overflow-hidden rounded-[1.5rem]" style={previewStyle}>
                <div className="flex min-h-[12rem] flex-col justify-between p-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full border border-white/20 bg-white/[0.12] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/90">
                      {selectedCommittee ? "Selección activa" : "Sin selección"}
                    </span>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.12] text-lg font-black">
                      {previewInitials}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                      {selectedCommittee ? "Opción elegida" : "Esperando una elección"}
                    </p>
                    <p className="mt-3 text-2xl font-bold leading-tight">
                      {selectedCommittee ? selectedCommittee.label : "Selecciona una tarjeta"}
                    </p>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-white/80">
                      {selectedCommittee
                        ? selectedCommittee.description
                        : "Selecciona una opción para continuar."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-[1.4rem] bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Paso 3
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Confirma solo cuando la opción sea exactamente la que deseas registrar.
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isPending || !votingOpen}
                    className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isPending ? "Registrando..." : "Confirmar selección"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isPending}
                    className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Reiniciar pantalla
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </section>

      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vote-confirm-title"
            aria-describedby="vote-confirm-description"
            className="panel-strong w-full max-w-md rounded-[1.9rem] p-6"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
              Confirmación
            </p>
            <h3 id="vote-confirm-title" className="mt-3 text-2xl font-bold text-slate-950">
              ¿Deseas registrar este voto?
            </h3>
            <p id="vote-confirm-description" className="mt-3 text-sm leading-7 text-slate-600">
              Se registrará la opción <span className="font-bold text-slate-900">{selectedLabel}</span>.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={handleSubmitVote}
                disabled={isPending}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                {isPending ? "Guardando..." : "Sí, registrar voto"}
              </button>
              <button
                type="button"
                onClick={closeConfirmation}
                disabled={isPending}
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
