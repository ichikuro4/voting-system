import { createSupabaseServerClient } from "@/lib/supabase";

const defaultSettings = {
  process_name: "Proceso electoral escolar",
  is_open: true,
};

export async function getElectionSettings() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("election_settings")
    .select("id, process_name, is_open, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo cargar la configuracion de la eleccion.");
  }

  if (!data) {
    return defaultSettings;
  }

  return {
    ...defaultSettings,
    ...data,
  };
}
