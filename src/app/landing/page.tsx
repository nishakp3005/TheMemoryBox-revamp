import Link from "next/link";

export default function Landing() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to ORA</h1>
        <p className="text-muted-foreground mb-8">
          Sign in to access your dashboard or create a new account.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="px-6 py-3 rounded-md bg-primary text-white font-semibold"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-md border border-primary text-primary font-semibold"
          >
            Sign up
          </Link>
        </div>
        <div className="mt-6 text-sm text-muted-foreground">
          <Link href="/dashboard" className="underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
