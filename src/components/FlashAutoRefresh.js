"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL_MS = 15000;

export default function FlashAutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      router.refresh();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [router]);

  return (
    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      Actualización automática cada 15 segundos
    </p>
  );
}
