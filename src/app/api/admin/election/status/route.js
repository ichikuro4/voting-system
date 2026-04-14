import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasAdminSession } from "@/lib/admin-auth";
import { registerAdminAudit } from "@/services/admin-audit";
import { setElectionOpenState } from "@/services/election";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const authenticated = await hasAdminSession();

    if (!authenticated) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesión administrativa requerida.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (typeof body?.isOpen !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "El campo isOpen es obligatorio y debe ser booleano.",
        },
        { status: 400 }
      );
    }

    const settings = await setElectionOpenState(body.isOpen);
    await registerAdminAudit({
      request,
      action: "election_status_updated",
      details: {
        is_open: settings.is_open,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/votar");

    return NextResponse.json({
      success: true,
      message: settings.is_open ? "La votación fue abierta." : "La votación fue cerrada.",
      settings,
    });
  } catch (error) {
    const message = error.message || "No se pudo actualizar el estado de la votación.";
    const status = message.includes("SUPABASE_SERVICE_ROLE_KEY") ? 500 : 400;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status }
    );
  }
}
