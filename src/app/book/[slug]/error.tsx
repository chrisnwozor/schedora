"use client";

import { Button } from "@/components/ui/button";

export default function BookingError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-6 text-black">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Booking could not be completed
        </h1>

        <p className="mt-3 leading-7 text-neutral-600">
          {error.message || "Please choose another time and try again."}
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
