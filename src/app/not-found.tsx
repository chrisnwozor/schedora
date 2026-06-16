import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 text-black">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 p-8 text-center">
        <p className="text-sm font-medium text-neutral-500">404</p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Page not found
        </h1>

        <p className="mt-3 leading-7 text-neutral-600">
          The page you are looking for does not exist or is no longer available.
        </p>

        <Button
          asChild
          className="mt-6 bg-black text-white hover:bg-neutral-800"
        >
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </main>
  );
}
