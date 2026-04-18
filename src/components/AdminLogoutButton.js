"use client";

import { useState, useTransition } from "react";

export default function AdminLogoutButton() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const helperMessage = errorMessage || "Finaliza la sesión administrativa activa en este navegador.";

  function handleLogout() {
    setErrorMessage("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/logout", {
          method: "POST",
        });

        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload?.message || "No se pudo cerrar sesión.");
        }

        window.location.href = "/admin/login";
      } catch (error) {
        setErrorMessage(error.message || "No se pudo cerrar sesión.");
      }
    });
  }

  return (
    <div className="action-card">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="btn-base btn-secondary w-full"
      >
        {isPending ? "Cerrando..." : "Cerrar sesión"}
      </button>
      <p className={`helper-text ${errorMessage ? "text-rose-700" : "text-slate-500"}`}>
        {helperMessage}
      </p>
    </div>
  );
}
