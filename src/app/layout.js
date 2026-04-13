import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Elecciones | Brüning School",
  description: "Plataforma oficial de votación para las elecciones del colegio Brüning School.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full">
        <div className="min-h-screen">
          <header className="border-b border-white/70 bg-white/85 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-800">
                  Colegio Brüning School
                </p>
                <Link href="/" className="text-xl font-bold text-slate-900">
                  Elecciones escolares
                </Link>
              </div>

              <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
                <Link
                  href="/"
                  className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Inicio
                </Link>
                <Link
                  href="/votar"
                  className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Votar
                </Link>
                <Link
                  href="/admin/login"
                  className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Resultados (Admin)
                </Link>
              </nav>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
