import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasAdminSession } from "@/lib/admin-auth";
import { registerAdminAudit } from "@/services/admin-audit";
import { resetAllVotes } from "@/services/votes";

export const dynamic = "force-dynamic";

const RESET_CONFIRMATION_TEXT = "REINICIAR";

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
    const confirmationText = String(body?.confirmText || "")
      .trim()
      .toUpperCase();

    if (confirmationText !== RESET_CONFIRMATION_TEXT) {
      return NextResponse.json(
        {
          success: false,
          message: `Confirmación inválida. Escribe ${RESET_CONFIRMATION_TEXT}.`,
        },
        { status: 400 }
      );
    }

    const result = await resetAllVotes();
    await registerAdminAudit({
      request,
      action: "votes_reset",
      details: {
        deleted_votes: result.deletedVotes,
      },
    });

    revalidatePath("/dashboard");

    return NextResponse.json({
      success: true,
      message: "La votación fue reiniciada correctamente.",
      deletedVotes: result.deletedVotes,
    });
  } catch (error) {
    const message = error.message || "No se pudo reiniciar la votación.";
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
