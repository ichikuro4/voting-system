"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const RESET_CONFIRMATION_TEXT = "REINICIAR";

export default function ResetVotesButton() {
  const router = useRouter();
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");
  const [isPending, startTransition] = useTransition();
  const helperMessage = feedbackMessage || "Elimina todos los votos registrados y reinicia el conteo.";

  function setFeedback(type, message) {
    setFeedbackType(type);
    setFeedbackMessage(message);
  }

  function handleReset() {
    const firstConfirmation = window.confirm(
      "Esta acción eliminará todos los votos registrados. ¿Deseas continuar?"
    );

    if (!firstConfirmation) {
      return;
    }

    const confirmationText = window.prompt(
      `Escribe ${RESET_CONFIRMATION_TEXT} para confirmar el reinicio.`,
      ""
    );

    if (!confirmationText) {
      return;
    }

    if (confirmationText.trim().toUpperCase() !== RESET_CONFIRMATION_TEXT) {
      setFeedback("error", `Confirmación inválida. Debes escribir ${RESET_CONFIRMATION_TEXT}.`);
      return;
    }

    setFeedbackMessage("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/votes/reset", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            confirmText: confirmationText,
          }),
        });

        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "No se pudo reiniciar la votación.");
        }

        setFeedback("success", `Votos eliminados: ${payload.deletedVotes}.`);
        router.refresh();
      } catch (error) {
        setFeedback("error", error.message || "No se pudo reiniciar la votación.");
      }
    });
  }

  return (
    <div className="h-full min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <button
        type="button"
        onClick={handleReset}
        disabled={isPending}
        className="w-full rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-rose-400"
      >
        {isPending ? "Reiniciando..." : "Reiniciar votación"}
      </button>
      <p
        className={`mt-2 min-h-10 text-xs leading-5 ${
          feedbackMessage
            ? feedbackType === "error"
              ? "text-rose-700"
              : "text-emerald-700"
            : "text-slate-500"
        }`}
      >
        {helperMessage}
      </p>
    </div>
  );
}
