import HomeStartVotingForm from "@/components/HomeStartVotingForm";

export default function Home() {
  return (
    <section>
      <div className="panel rounded-[2rem] p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-800">
              Elecciones del colegio Brüning School
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-serif text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Plataforma oficial de votación estudiantil
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">
                Ingresa tu DNI o carnet de extranjería para habilitar el voto y continuar al
                formulario oficial.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <HomeStartVotingForm />
          </div>
        </div>
      </div>
    </section>
  );
}
