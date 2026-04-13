"use client";

import { useState, useTransition } from "react";

export default function AdminLoginForm({ nextPath = "/dashboard", authConfigured = true }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Ingresa usuario y contrasena.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
            nextPath,
          }),
        });

        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "No se pudo iniciar sesion.");
        }

        window.location.href = payload.redirectTo || nextPath;
      } catch (error) {
        setErrorMessage(error.message || "No se pudo iniciar sesion.");
      }
    });
  }

  return (
    <section className="panel-strong mx-auto max-w-lg rounded-[2rem] p-8 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-800">
        Acceso administrativo
      </p>
      <h1 className="mt-4 font-serif text-4xl font-bold text-slate-950">Ingreso al dashboard</h1>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Usa credenciales administrativas para consultar los resultados de la votacion.
      </p>

      {!authConfigured ? (
        <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Configura `ADMIN_USERNAME`, `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET` en `.env.local`.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-semibold text-slate-800">
            Usuario
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            placeholder="username"
            autoComplete="username"
            disabled={isPending || !authConfigured}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-800">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            placeholder="********"
            autoComplete="current-password"
            disabled={isPending || !authConfigured}
          />
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending || !authConfigured}
          className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </section>
  );
}
