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
    <div className="h-full min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Cerrando..." : "Cerrar sesión"}
      </button>
      <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
        Finaliza la sesión administrativa activa en este navegador.
      </p>
    </div>
  );
}
