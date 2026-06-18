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
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#fafafa",
            color: "#000000",
            padding: "24px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <section
            style={{
              width: "100%",
              maxWidth: "520px",
              border: "1px solid #e5e5e5",
              borderRadius: "16px",
              background: "#ffffff",
              padding: "32px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#737373",
              }}
            >
              Schedora encountered a problem
            </p>

            <h1
              style={{
                margin: "12px 0 0",
                fontSize: "30px",
                lineHeight: 1.2,
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                margin: "16px 0 0",
                lineHeight: 1.7,
                color: "#525252",
              }}
            >
              The application could not continue. Try again or return to the
              home page.
            </p>

            {error.digest ? (
              <p
                style={{
                  margin: "16px 0 0",
                  fontSize: "12px",
                  color: "#737373",
                }}
              >
                Reference: {error.digest}
              </p>
            ) : null}

            <div
              style={{
                display: "grid",
                gap: "12px",
                marginTop: "32px",
              }}
            >
              <button
                type="button"
                onClick={reset}
                style={{
                  height: "44px",
                  border: 0,
                  borderRadius: "12px",
                  background: "#000000",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Try again
              </button>

              <a
                href="/"
                style={{
                  display: "inline-flex",
                  height: "44px",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #e5e5e5",
                  borderRadius: "12px",
                  color: "#000000",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Return home
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
