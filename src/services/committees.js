import { createSupabaseServerClient } from "@/lib/supabase";

export async function getActiveCommittees() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("committees")
    .select("id, name, short_description, color, active")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar los comités activos.");
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
    throw new Error("No se pudieron cargar los comités.");
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
    throw new Error("No se pudo validar el comité seleccionado.");
  }

  return data;
}
