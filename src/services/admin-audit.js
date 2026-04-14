import { createSupabaseAdminClient } from "@/lib/supabase";

function extractRequestMetadata(request) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const ipAddress = forwardedFor.split(",")[0]?.trim() || null;
  const userAgent = request.headers.get("user-agent") || null;

  return {
    ipAddress,
    userAgent,
  };
}

export async function registerAdminAudit({ request, action, details = {} }) {
  try {
    const supabase = createSupabaseAdminClient();
    const metadata = extractRequestMetadata(request);

    const { error } = await supabase.from("admin_audit_logs").insert({
      admin_username: process.env.ADMIN_USERNAME || "admin",
      action,
      details,
      ip_address: metadata.ipAddress,
      user_agent: metadata.userAgent,
    });

    if (error) {
      console.error("No se pudo registrar auditoría admin:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("No se pudo registrar auditoría admin:", error.message);
    return false;
  }
}
