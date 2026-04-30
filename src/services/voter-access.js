import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";
import { isValidMesaPair, normalizeMesaAula } from "@/lib/mesa-config";
import { getElectionSettings } from "@/services/election";

const DOCUMENT_PATTERN = /^\d{7,9}$/;

export function normalizeDni(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 9);
}

export function validateDni(value) {
  const normalizedDni = normalizeDni(value);

  if (!DOCUMENT_PATTERN.test(normalizedDni)) {
    throw new Error("Ingresa un documento válido de 7 a 9 dígitos.");
  }

  return normalizedDni;
}

function validateMesaSelection(mesaNumero, mesaAula) {
  const normalizedMesaNumero = Number(mesaNumero);
  const normalizedMesaAula = normalizeMesaAula(mesaAula);

  if (!isValidMesaPair(normalizedMesaNumero, normalizedMesaAula)) {
    throw new Error("Selecciona una mesa válida para continuar.");
  }

  return {
    mesaNumero: normalizedMesaNumero,
    mesaAula: normalizedMesaAula,
  };
}

async function assertDniBelongsToMesa({ normalizedDni, mesaNumero, mesaAula }) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("eligible_voters")
    .select("dni, mesa_numero, mesa_aula")
    .eq("dni", normalizedDni)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo validar el documento en el padrón.");
  }

  if (!data) {
    throw new Error("Este documento no está registrado en el padrón de votación.");
  }

  const registeredMesaNumero = Number(data.mesa_numero);
  const registeredMesaAula = normalizeMesaAula(data.mesa_aula);

  if (registeredMesaNumero !== mesaNumero || registeredMesaAula !== mesaAula) {
    throw new Error(
      `Este documento corresponde a la Mesa ${registeredMesaNumero} (${registeredMesaAula}).`
    );
  }
}

async function resolveExistingEntryMesaPolicy({
  supabase,
  normalizedDni,
  existingEntry,
  mesaNumero,
  mesaAula,
}) {
  if (!existingEntry) {
    throw new Error("No se pudo validar el documento.");
  }

  if (existingEntry?.has_voted) {
    throw new Error("Este documento ya votó.");
  }

  const existingMesaNumero = existingEntry?.mesa_numero ?? null;
  const existingMesaAula = normalizeMesaAula(existingEntry?.mesa_aula ?? "");
  const existingMesaMissing = existingMesaNumero === null || !existingMesaAula;

  if (existingMesaMissing) {
    const { error: updateMesaError } = await supabase
      .from("voter_access")
      .update({
        mesa_numero: mesaNumero,
        mesa_aula: mesaAula,
      })
      .eq("dni", normalizedDni)
      .eq("has_voted", false);

    if (updateMesaError) {
      throw new Error("No se pudo actualizar la mesa del documento.");
    }

    return;
  }

  if (existingMesaNumero !== mesaNumero || existingMesaAula !== mesaAula) {
    throw new Error(
      `Este documento ya fue habilitado en la Mesa ${existingMesaNumero} (${existingMesaAula}).`
    );
  }
}

export async function registerVoterAccess({ dni, mesaNumero, mesaAula }) {
  const normalizedDni = validateDni(dni);
  const normalizedMesa = validateMesaSelection(mesaNumero, mesaAula);
  const settings = await getElectionSettings();

  if (!settings.is_open) {
    throw new Error("La votación se encuentra cerrada.");
  }

  await assertDniBelongsToMesa({
    normalizedDni,
    mesaNumero: normalizedMesa.mesaNumero,
    mesaAula: normalizedMesa.mesaAula,
  });

  const supabase = createSupabaseServerClient();
  const { data: existingEntry, error: selectError } = await supabase
    .from("voter_access")
    .select("dni, has_voted, mesa_numero, mesa_aula")
    .eq("dni", normalizedDni)
    .maybeSingle();

  if (selectError) {
    throw new Error("No se pudo validar el documento.");
  }

  if (existingEntry) {
    await resolveExistingEntryMesaPolicy({
      supabase,
      normalizedDni,
      existingEntry,
      mesaNumero: normalizedMesa.mesaNumero,
      mesaAula: normalizedMesa.mesaAula,
    });

    return {
      dni: normalizedDni,
      mesaNumero: normalizedMesa.mesaNumero,
      mesaAula: normalizedMesa.mesaAula,
      alreadyRegistered: true,
    };
  }

  const { error: insertError } = await supabase.from("voter_access").insert({
    dni: normalizedDni,
    has_voted: false,
    mesa_numero: normalizedMesa.mesaNumero,
    mesa_aula: normalizedMesa.mesaAula,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: raceEntry } = await supabase
        .from("voter_access")
        .select("dni, has_voted, mesa_numero, mesa_aula")
        .eq("dni", normalizedDni)
        .maybeSingle();

      await resolveExistingEntryMesaPolicy({
        supabase,
        normalizedDni,
        existingEntry: raceEntry,
        mesaNumero: normalizedMesa.mesaNumero,
        mesaAula: normalizedMesa.mesaAula,
      });

      return {
        dni: normalizedDni,
        mesaNumero: normalizedMesa.mesaNumero,
        mesaAula: normalizedMesa.mesaAula,
        alreadyRegistered: true,
      };
    }

    throw new Error("No se pudo registrar el documento.");
  }

  return {
    dni: normalizedDni,
    mesaNumero: normalizedMesa.mesaNumero,
    mesaAula: normalizedMesa.mesaAula,
    alreadyRegistered: false,
  };
}

export async function assertVoterCanVote(dni) {
  const normalizedDni = validateDni(dni);
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("voter_access")
    .select("dni, has_voted")
    .eq("dni", normalizedDni)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo validar el documento antes de registrar el voto.");
  }

  if (!data) {
    throw new Error("Primero debes ingresar tu documento en la página de inicio.");
  }

  if (data.has_voted) {
    throw new Error("Este documento ya votó.");
  }

  return normalizedDni;
}

export async function markVoterAsVoted(dni) {
  const normalizedDni = validateDni(dni);
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("voter_access")
    .update({
      has_voted: true,
      voted_at: new Date().toISOString(),
    })
    .eq("dni", normalizedDni)
    .eq("has_voted", false);

  if (error) {
    throw new Error("No se pudo actualizar el estado del documento.");
  }
}
