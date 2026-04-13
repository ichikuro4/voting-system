import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-8">
      <div className="panel rounded-[2rem] p-8 sm:p-10">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-800">
            Elecciones del colegio Brüning School
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-serif text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Plataforma oficial de votación estudiantil
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-700">
              Selecciona un comité o voto en blanco y confirma tu elección en pocos pasos.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/votar"
              className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Iniciar votación
            </Link>
            <Link
              href="/admin/login"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Resultados (Administración)
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <article className="panel-strong rounded-[1.5rem] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Paso 1</p>
          <h2 className="mt-3 text-xl font-bold text-slate-950">Seleccionar opción</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            El alumno elige un comité o la opción de voto en blanco.
          </p>
        </article>

        <article className="panel-strong rounded-[1.5rem] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Paso 2</p>
          <h2 className="mt-3 text-xl font-bold text-slate-950">Revisar selección</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Antes de enviar, la pantalla muestra claramente la opción elegida.
          </p>
        </article>

        <article className="panel-strong rounded-[1.5rem] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Paso 3</p>
          <h2 className="mt-3 text-xl font-bold text-slate-950">Confirmar voto</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            El voto se registra y el sistema queda listo para el siguiente alumno.
          </p>
        </article>
      </div>
    </section>
  );
}
