"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application route error:", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-6 text-black">
      <section className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 text-center">
        <p className="text-sm font-medium text-neutral-500">
          Something went wrong
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          We could not load this page
        </h1>

        <p className="mt-4 leading-7 text-neutral-600">
          An unexpected problem occurred. Try loading the page again.
        </p>

        {error.digest ? (
          <p className="mt-4 text-xs text-neutral-500">
            Reference: {error.digest}
          </p>
        ) : null}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Try again
          </button>

          <a
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 px-5 text-sm font-medium hover:bg-neutral-50"
          >
            Go to dashboard
          </a>
        </div>
      </section>
    </main>
  );
}
