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
    <div className="action-card">
      <button
        type="button"
        onClick={handleReset}
        disabled={isPending}
        className="btn-base btn-danger w-full"
      >
        {isPending ? "Reiniciando..." : "Reiniciar votación"}
      </button>
      <p
        className={`helper-text ${
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
