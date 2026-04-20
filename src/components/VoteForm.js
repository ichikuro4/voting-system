"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import VoteCard from "@/components/VoteCard";
import {
  getCandidateDisplayName,
  getCommitteeVisualData,
  getListDisplayName,
} from "@/lib/committee-visuals";

export default function VoteForm({
  committees,
  processName,
  votingOpen,
  voterDni,
  readOnlyPreview = false,
}) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const selectedCommitteeRecord = committees.find((committee) => committee.id === selectedOption);
  const selectedCommitteeListName = selectedCommitteeRecord
    ? getListDisplayName(selectedCommitteeRecord.name)
    : "";
  const selectedLabel = selectedCommitteeListName || "Voto en blanco";

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

    if (readOnlyPreview) {
      setErrorMessage("Modo vista administrativa: no se permite registrar votos.");
      return;
    }

    if (!votingOpen) {
      setErrorMessage("La votación está cerrada en este momento.");
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
      const isBlankVote = !selectedOption;

      try {
        const response = await fetch("/api/votes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dni: voterDni,
            committeeId: isBlankVote ? null : selectedOption,
            voteBlank: isBlankVote,
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
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
            Boleta digital
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Selecciona tu opción de voto
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            {processName || "Elecciones del Municipio Escolar"}.
          </p>
        </div>

        {!votingOpen ? (
          <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-rose-900">
            La votación está cerrada en este momento. Consulta al responsable de mesa.
          </div>
        ) : null}

        <form onSubmit={handleAskConfirmation} className="mt-8 space-y-6">
          {errorMessage ? (
            <div
              role="alert"
              className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
            >
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {committees.map((committee) => {
              const listDisplayName = getListDisplayName(committee.name);
              const candidateDisplayName = getCandidateDisplayName(committee.name);
              const visualData = getCommitteeVisualData(committee.name);
              const hasCandidateName =
                candidateDisplayName &&
                candidateDisplayName.trim() &&
                candidateDisplayName !== listDisplayName;

              return (
                <VoteCard
                  key={committee.id}
                  value={committee.id}
                  title={listDisplayName}
                  candidateName={hasCandidateName ? candidateDisplayName : ""}
                  logoLabel={visualData.logoLabel}
                  candidateImageSrc={visualData.candidateImageSrc}
                  color={committee.color}
                  selected={selectedOption === committee.id}
                  onChange={handleSelection}
                />
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={isPending || !votingOpen || readOnlyPreview}
              className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {readOnlyPreview
                ? "Vista admin (solo lectura)"
                : isPending
                  ? "Registrando..."
                  : "Siguiente"}
            </button>

          </div>
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
              {selectedOption ? (
                <>
                  Se registrará la opción{" "}
                  <span className="font-bold text-slate-900">{selectedLabel}</span>.
                </>
              ) : (
                <>
                  No seleccionaste una lista. Se registrará{" "}
                  <span className="font-bold text-slate-900">Voto en blanco</span>.
                </>
              )}
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
