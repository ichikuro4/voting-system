"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const REDIRECT_SECONDS = 20;

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
        Voto registrado
      </p>
      <h1 className="mt-4 font-serif text-4xl font-bold text-slate-950">
        Tu voto se registró correctamente
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-700">
        La pantalla se preparará automáticamente para el siguiente alumno.
      </p>

      <div className="mt-8 rounded-[1.5rem] bg-slate-50 px-6 py-5">
        <p className="text-sm font-semibold text-slate-900">
          Regresando a inicio en {secondsLeft} segundo{secondsLeft === 1 ? "" : "s"}.
        </p>
      </div>

    </section>
  );
}
