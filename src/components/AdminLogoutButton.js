"use client";

import { useTransition } from "react";

export default function AdminLogoutButton() {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await fetch("/api/admin/logout", {
        method: "POST",
      });

      window.location.href = "/admin/login";
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
      <p className="helper-text text-slate-500">
        Finaliza la sesión administrativa activa en este navegador.
      </p>
    </div>
  );
}
