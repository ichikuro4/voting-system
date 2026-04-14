import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";

const defaultSettings = {
  process_name: "Elecciones del colegio Brüning School",
  is_open: true,
};

const settingsSelectFields = "id, process_name, is_open, created_at";

export async function getElectionSettings() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("election_settings")
    .select(settingsSelectFields)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo cargar la configuración de la elección.");
  }

  if (!data) {
    return defaultSettings;
  }

  return {
    ...defaultSettings,
    ...data,
  };
}

export async function setElectionOpenState(isOpen) {
  const supabase = createSupabaseAdminClient();
  const normalizedIsOpen = Boolean(isOpen);

  const { data: latestSettings, error: readError } = await supabase
    .from("election_settings")
    .select(settingsSelectFields)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (readError) {
    throw new Error("No se pudo obtener la configuración actual de la elección.");
  }

  if (!latestSettings) {
    const { data, error } = await supabase
      .from("election_settings")
      .insert({
        process_name: defaultSettings.process_name,
        is_open: normalizedIsOpen,
      })
      .select(settingsSelectFields)
      .single();

    if (error) {
      throw new Error("No se pudo crear la configuración de la elección.");
    }

    return {
      ...defaultSettings,
      ...data,
    };
  }

  if (latestSettings.is_open === normalizedIsOpen) {
    return {
      ...defaultSettings,
      ...latestSettings,
    };
  }

  const { data, error } = await supabase
    .from("election_settings")
    .update({ is_open: normalizedIsOpen })
    .eq("id", latestSettings.id)
    .select(settingsSelectFields)
    .single();

  if (error) {
    throw new Error("No se pudo actualizar el estado de la votación.");
  }

  return {
    ...defaultSettings,
    ...data,
  };
}
