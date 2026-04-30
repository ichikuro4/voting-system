"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getMesaOptionByAula, MESA_OPTIONS } from "@/lib/mesa-config";

const MAX_DOCUMENT_LENGTH = 9;

function normalizeDni(value) {
  return String(value || "").replace(/\D/g, "").slice(0, MAX_DOCUMENT_LENGTH);
}

function isValidDocument(value) {
  return /^\d{7,9}$/.test(value);
}

export default function HomeStartVotingForm() {
  const router = useRouter();
  const [dni, setDni] = useState("");
  const [mesaAula, setMesaAula] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDniChange(event) {
    setDni(normalizeDni(event.target.value));
    setErrorMessage("");
  }

  function handleMesaChange(event) {
    setMesaAula(event.target.value);
    setErrorMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const normalizedDni = normalizeDni(dni);
    const mesa = getMesaOptionByAula(mesaAula);

    if (!isValidDocument(normalizedDni)) {
      setErrorMessage("Ingresa un documento válido de 7 a 9 dígitos.");
      return;
    }

    if (!mesa) {
      setErrorMessage("Selecciona la mesa correspondiente.");
      return;
    }

    setErrorMessage("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/voter-access", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dni: normalizedDni,
            mesaNumero: mesa.mesaNumero,
            mesaAula: mesa.mesaAula,
          }),
        });

        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "No se pudo validar el documento.");
        }

        router.push(`/votar?dni=${encodeURIComponent(payload.dni)}`);
      } catch (error) {
        setErrorMessage(error.message || "No se pudo validar el documento.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
          Acceso a votación
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          Ingresa tu documento
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Acepta documentos de 7 a 9 dígitos. Selecciona tu mesa antes de continuar.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="dni" className="text-sm font-semibold text-slate-800">
          DNI o carnet de extranjería
        </label>
        <input
          id="dni"
          name="dni"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={dni}
          onChange={handleDniChange}
          maxLength={MAX_DOCUMENT_LENGTH}
          placeholder="Ejemplo: 12345678 o 123456789"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="mesa" className="text-sm font-semibold text-slate-800">
          Mesa
        </label>
        <select
          id="mesa"
          name="mesa"
          value={mesaAula}
          onChange={handleMesaChange}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        >
          <option value="">Selecciona tu mesa</option>
          {MESA_OPTIONS.map((mesa) => (
            <option key={mesa.mesaAula} value={mesa.mesaAula}>
              {mesa.label}
            </option>
          ))}
        </select>
      </div>

      {errorMessage ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isPending ? "Validando..." : "Aceptar y votar"}
      </button>
    </form>
  );
}
