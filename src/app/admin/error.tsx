"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 text-black">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin action failed
        </h1>

        <p className="mt-3 leading-7 text-neutral-600">
          {error.message || "The admin request could not be completed."}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Button
            onClick={reset}
            className="bg-black text-white hover:bg-neutral-800"
          >
            Try again
          </Button>

          <Button variant="outline" onClick={() => window.history.back()}>
            Go back
          </Button>
        </div>
      </div>
    </main>
  );
}
