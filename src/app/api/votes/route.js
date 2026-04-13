import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { registerVote } from "@/services/votes";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const vote = await registerVote({
      committeeId: body.committeeId ?? null,
      voteBlank: Boolean(body.voteBlank),
    });

    revalidatePath("/dashboard");

    return NextResponse.json({
      success: true,
      message: "Voto registrado correctamente.",
      vote,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "No se pudo registrar el voto.",
      },
      { status: 400 }
    );
  }
}
