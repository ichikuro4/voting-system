import { createSupabaseServerClient } from "@/lib/supabase";

const defaultSettings = {
  process_name: "Elecciones del colegio Brüning School",
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
