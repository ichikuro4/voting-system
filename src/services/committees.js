import { createSupabaseServerClient } from "@/lib/supabase";

export async function getActiveCommittees() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("committees")
    .select("id, name, short_description, color, active")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar las listas activas.");
  }

  return data ?? [];
}

export async function getAllCommittees() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("committees")
    .select("id, name, short_description, color, active")
    .order("name", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar las listas.");
  }

  return data ?? [];
}

export async function getActiveCommitteeById(committeeId) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("committees")
    .select("id, name, short_description, color, active")
    .eq("id", committeeId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo validar la lista seleccionada.");
  }

  return data;
}
