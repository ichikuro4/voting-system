"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const REDIRECT_SECONDS = 10;

export default function VoteSuccessPanel() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    const countdownInterval = window.setInterval(() => {
      setSecondsLeft((currentValue) => {
        if (currentValue <= 1) {
          window.clearInterval(countdownInterval);
          return 0;
        }

        return currentValue - 1;
      });
    }, 1000);

    const redirectTimeout = window.setTimeout(() => {
      router.replace("/");
    }, REDIRECT_SECONDS * 1000);

    return () => {
      window.clearInterval(countdownInterval);
      window.clearTimeout(redirectTimeout);
    };
  }, [router]);

  return (
    <section className="panel-strong mx-auto max-w-3xl rounded-[2rem] p-8 text-center sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
        OK
      </div>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">
        Voto emitido
      </p>
      <h1 className="mt-4 font-serif text-4xl font-bold text-slate-950">
        Su voto fue registrado correctamente
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-700">
        Gracias por participar en este proceso electoral escolar. El registro ya fue almacenado y el
        sistema se preparara automaticamente para continuar con el siguiente alumno de forma ordenada y
        supervisada.
      </p>

      <div className="mt-8 rounded-[1.5rem] bg-slate-50 px-6 py-5">
        <p className="text-sm font-semibold text-slate-900">
          Regresando a la pagina de inicio en {secondsLeft} segundo{secondsLeft === 1 ? "" : "s"}.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Si deseas continuar antes, puedes volver ahora mismo desde el boton inferior.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Ir al inicio ahora
        </Link>
        <Link
          href="/votar"
          className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Volver a votar
        </Link>
      </div>
    </section>
  );
}
