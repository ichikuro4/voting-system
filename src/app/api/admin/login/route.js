import { NextResponse } from "next/server";
import {
  createAdminSessionValue,
  getAdminSessionCookieName,
  getAdminSessionMaxAge,
  validateAdminCredentials,
} from "@/lib/admin-auth";
import { getSafeInternalPath } from "@/lib/safe-redirect";

export async function POST(request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    const redirectTo = getSafeInternalPath(body.nextPath, "/dashboard");

    if (!validateAdminCredentials(username, password)) {
      return NextResponse.json(
        {
          success: false,
          message: "Credenciales inválidas.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      redirectTo,
    });

    response.cookies.set({
      name: getAdminSessionCookieName(),
      value: createAdminSessionValue(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: getAdminSessionMaxAge(),
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "No se pudo iniciar sesión.",
      },
      { status: 400 }
    );
  }
}
