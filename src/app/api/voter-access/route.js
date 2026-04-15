import { NextResponse } from "next/server";
import { registerVoterAccess } from "@/services/voter-access";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await registerVoterAccess(body?.dni);

    return NextResponse.json({
      success: true,
      message: "Documento habilitado para votar.",
      dni: result.dni,
      alreadyRegistered: result.alreadyRegistered,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "No se pudo registrar el documento.",
      },
      { status: 400 }
    );
  }
}
