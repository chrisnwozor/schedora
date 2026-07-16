import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { slug } = await params;
  const { name } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-6 py-10 text-black">
      <Card className="w-full max-w-lg rounded-2xl border-neutral-200 bg-white shadow-none">
        <CardContent className="p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-black text-white">
            <CheckCircle2 className="size-8" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            Booking request sent
          </h1>

          <p className="mt-4 leading-7 text-neutral-600">
            {name
              ? `${name}, your appointment request has been received.`
              : "Your appointment request has been received."}
            The business will review and confirm your appointment.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button
              asChild
              className="bg-black text-white hover:bg-neutral-800"
            >
              <Link href={`/book/${slug}`}>Book another</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/dashboard">Back to Schedora</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
