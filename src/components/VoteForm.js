"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import VoteCard from "@/components/VoteCard";

const blankOptionValue = "blank";

export default function VoteForm({ committees, processName, votingOpen }) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedLabel =
    selectedOption === blankOptionValue
      ? "Voto en blanco"
      : committees.find((committee) => committee.id === selectedOption)?.name || "";

  function handleSelection(value) {
    setSelectedOption(value);
    setErrorMessage("");
  }

  function handleAskConfirmation(event) {
    event.preventDefault();

    if (!votingOpen) {
      setErrorMessage("La votacion esta cerrada en este momento.");
      return;
    }

    if (!selectedOption) {
      setErrorMessage("Debes seleccionar un comite o la opcion de voto en blanco.");
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
        setErrorMessage(error.message || "Ocurrio un problema al registrar el voto.");
        setShowConfirm(false);
      }
    });
  }

  return (
    <>
      <section className="panel-strong rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Selecciona una opcion</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {processName || "Proceso electoral escolar"}. Solo puede emitirse una opcion por envio.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Comites activos: {committees.length}</p>
            <p>Siempre se mantiene disponible la opcion de voto en blanco.</p>
          </div>
        </div>

        {!votingOpen ? (
          <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-rose-900">
            La votacion esta cerrada. Cambia el valor `is_open` en `election_settings` para habilitarla.
          </div>
        ) : null}

        <form onSubmit={handleAskConfirmation} className="mt-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {committees.map((committee) => (
              <VoteCard
                key={committee.id}
                value={committee.id}
                title={committee.name}
                description={
                  committee.short_description || "Comite participante en la eleccion escolar."
                }
                color={committee.color}
                selected={selectedOption === committee.id}
                onChange={handleSelection}
              />
            ))}

            <VoteCard
              value={blankOptionValue}
              title="Voto en blanco"
              description="Registra un voto sin seleccionar a ningun comite."
              color="#94a3b8"
              isBlank
              selected={selectedOption === blankOptionValue}
              onChange={handleSelection}
            />
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isPending || !votingOpen}
              className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isPending ? "Registrando..." : "Confirmar voto"}
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
        </form>
      </section>

      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="panel-strong w-full max-w-md rounded-[1.75rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
              Confirmacion
            </p>
            <h3 className="mt-3 text-2xl font-bold text-slate-950">Esta seguro de emitir su voto?</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Se registrara la opcion <span className="font-bold text-slate-900">{selectedLabel}</span>.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSubmitVote}
                disabled={isPending}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                {isPending ? "Guardando..." : "Si, emitir voto"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
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
