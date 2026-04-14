import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let browserClient;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function isSupabaseAdminConfigured() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

function assertSupabaseConfig() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Faltan las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
}

function assertSupabaseAdminConfig() {
  if (!isSupabaseAdminConfigured()) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY para ejecutar acciones administrativas en Supabase."
    );
  }
}

function createBaseClient(apiKey) {
  return createClient(supabaseUrl, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function createSupabaseServerClient() {
  assertSupabaseConfig();
  return createBaseClient(supabaseAnonKey);
}

export function createSupabaseAdminClient() {
  assertSupabaseAdminConfig();
  return createBaseClient(supabaseServiceRoleKey);
}

export function createSupabaseBrowserClient() {
  assertSupabaseConfig();

  if (!browserClient) {
    browserClient = createBaseClient(supabaseAnonKey);
  }

  return browserClient;
}
