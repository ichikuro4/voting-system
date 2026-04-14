"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function ElectionStatusToggleButton({ isOpen }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const helperMessage = errorMessage || (isOpen ? "La votación está abierta." : "La votación está cerrada.");

  function handleToggle() {
    const nextState = !isOpen;
    const confirmationMessage = nextState
      ? "¿Deseas abrir la votación?"
      : "¿Deseas cerrar la votación? Los alumnos no podrán votar mientras esté cerrada.";

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setErrorMessage("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/election/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isOpen: nextState }),
        });

        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "No se pudo actualizar la votación.");
        }

        router.refresh();
      } catch (error) {
        setErrorMessage(error.message || "No se pudo actualizar la votación.");
      }
    });
  }

  return (
    <div className="action-card">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`btn-base w-full ${
          isOpen
            ? "bg-rose-600 text-white hover:bg-rose-700"
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        {isPending ? "Actualizando..." : isOpen ? "Cerrar votación" : "Abrir votación"}
      </button>
      <p
        className={`helper-text ${errorMessage ? "text-rose-700" : "text-slate-500"}`}
      >
        {helperMessage}
      </p>
    </div>
  );
}
