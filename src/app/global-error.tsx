"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global app error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>
          Something went wrong
        </h1>
        <p style={{ color: "#666", marginBottom: "24px", maxWidth: "420px" }}>
          We&apos;re having trouble loading this page right now. Please try again in a moment.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "10px 24px",
            borderRadius: "999px",
            background: "#D4AF37",
            color: "#fff",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
