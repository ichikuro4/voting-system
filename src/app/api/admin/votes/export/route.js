import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { registerAdminAudit } from "@/services/admin-audit";
import { getVotesForExport } from "@/services/votes";

export const dynamic = "force-dynamic";

function buildFileTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);
  const spreadsheetSafeValue = /^[\t\r ]*[=+\-@]/.test(stringValue)
    ? `'${stringValue}`
    : stringValue;

  if (/[",\n]/.test(spreadsheetSafeValue)) {
    return `"${spreadsheetSafeValue.replace(/"/g, '""')}"`;
  }

  return spreadsheetSafeValue;
}

function buildCsvContent(rows) {
  const headers = [
    "id",
    "student_dni",
    "created_at",
    "vote_blank",
    "committee_id",
    "committee_name",
  ];
  const lines = [headers.join(",")];

  rows.forEach((row) => {
    lines.push(
      [
        escapeCsvValue(row.id),
        escapeCsvValue(row.student_dni),
        escapeCsvValue(row.created_at),
        escapeCsvValue(row.vote_blank),
        escapeCsvValue(row.committee_id),
        escapeCsvValue(row.committee_name),
      ].join(",")
    );
  });

  return `${lines.join("\n")}\n`;
}

export async function GET(request) {
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

    const requestUrl = new URL(request.url);
    const format = String(requestUrl.searchParams.get("format") || "csv").toLowerCase();

    if (!["csv", "json"].includes(format)) {
      return NextResponse.json(
        {
          success: false,
          message: "Formato de exportación inválido. Usa csv o json.",
        },
        { status: 400 }
      );
    }

    const rows = await getVotesForExport();
    const exportedAt = new Date().toISOString();
    const fileTimestamp = buildFileTimestamp();

    await registerAdminAudit({
      request,
      action: "votes_exported",
      details: {
        format,
        total_votes: rows.length,
      },
    });

    if (format === "json") {
      return new NextResponse(
        JSON.stringify(
          {
            exported_at: exportedAt,
            total_votes: rows.length,
            votes: rows,
          },
          null,
          2
        ),
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename="votacion_${fileTimestamp}.json"`,
          },
        }
      );
    }

    const csvContent = buildCsvContent(rows);

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="votacion_${fileTimestamp}.csv"`,
      },
    });
  } catch (error) {
    const message = error.message || "No se pudo exportar la votación.";
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
