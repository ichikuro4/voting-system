import { createSupabaseServerClient } from "@/lib/supabase";
import { getElectionSettings } from "@/services/election";

const DOCUMENT_PATTERN = /^\d{8,9}$/;

export function normalizeDni(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 9);
}

export function validateDni(value) {
  const normalizedDni = normalizeDni(value);

  if (!DOCUMENT_PATTERN.test(normalizedDni)) {
    throw new Error("Ingresa un DNI (8 dígitos) o carnet de extranjería (9 dígitos) válido.");
  }

  return normalizedDni;
}

export async function registerVoterAccess(dni) {
  const normalizedDni = validateDni(dni);
  const settings = await getElectionSettings();

  if (!settings.is_open) {
    throw new Error("La votación se encuentra cerrada.");
  }

  const supabase = createSupabaseServerClient();
  const { data: existingEntry, error: selectError } = await supabase
    .from("voter_access")
    .select("dni, has_voted")
    .eq("dni", normalizedDni)
    .maybeSingle();

  if (selectError) {
    throw new Error("No se pudo validar el documento.");
  }

  if (existingEntry?.has_voted) {
    throw new Error("Este documento ya votó.");
  }

  if (existingEntry) {
    return {
      dni: normalizedDni,
      alreadyRegistered: true,
    };
  }

  const { error: insertError } = await supabase.from("voter_access").insert({
    dni: normalizedDni,
    has_voted: false,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: raceEntry } = await supabase
        .from("voter_access")
        .select("dni, has_voted")
        .eq("dni", normalizedDni)
        .maybeSingle();

      if (raceEntry?.has_voted) {
        throw new Error("Este documento ya votó.");
      }

      return {
        dni: normalizedDni,
        alreadyRegistered: true,
      };
    }

    throw new Error("No se pudo registrar el documento.");
  }

  return {
    dni: normalizedDni,
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
