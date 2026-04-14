"use client";

import { useState, useTransition } from "react";

function getFileNameFromDisposition(contentDisposition) {
  if (!contentDisposition) {
    return "";
  }

  const match = contentDisposition.match(/filename="([^"]+)"/i);
  return match?.[1] || "";
}

function triggerDownload(blob, fileName) {
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export default function ExportVotesButton() {
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");
  const [isPending, startTransition] = useTransition();
  const helperMessage = feedbackMessage || "Descarga respaldo de votos en CSV o JSON.";

  function setFeedback(type, message) {
    setFeedbackType(type);
    setFeedbackMessage(message);
  }

  function handleExport(format) {
    setFeedbackMessage("");

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/votes/export?format=${format}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload.message || "No se pudo exportar la votación.");
        }

        const blob = await response.blob();
        const contentDisposition = response.headers.get("content-disposition");
        const fileName =
          getFileNameFromDisposition(contentDisposition) || `votacion_backup.${format}`;

        triggerDownload(blob, fileName);
        setFeedback("success", `Exportación ${format.toUpperCase()} completada.`);
      } catch (error) {
        setFeedback("error", error.message || "No se pudo exportar la votación.");
      }
    });
  }

  return (
    <div className="action-card">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleExport("csv")}
          disabled={isPending}
          className="btn-base btn-dark w-full px-4"
        >
          {isPending ? "Exportando..." : "Exportar CSV"}
        </button>
        <button
          type="button"
          onClick={() => handleExport("json")}
          disabled={isPending}
          className="btn-base btn-secondary w-full px-4"
        >
          JSON
        </button>
      </div>
      <p
        className={`helper-text ${
          feedbackMessage
            ? feedbackType === "error"
              ? "text-rose-700"
              : "text-emerald-700"
            : "text-slate-500"
        }`}
      >
        {helperMessage}
      </p>
    </div>
  );
}
