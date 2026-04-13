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
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isPending ? "Cerrando..." : "Cerrar sesion"}
    </button>
  );
}
