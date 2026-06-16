import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <a href="/" className="text-2xl font-bold tracking-tight text-black">
            schedora
          </a>
          <p className="mt-2 text-sm text-neutral-600">
            Create your Schedora account.
          </p>
        </div>

        <SignUp />
      </div>
    </main>
  );
}
