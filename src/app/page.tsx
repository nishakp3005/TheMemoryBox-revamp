import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-b from-background to-background/80 px-4">
      <div className="w-full max-w-xl text-center">
        <div className="mb-8">
          <img src="/logo-dark.png" alt="The Memory Box" className="mx-auto h-16" />
          <h1 className="text-4xl font-bold mt-4">Welcome to The Memory Box</h1>
          <p className="text-muted-foreground mt-2">
            Join us and start saving your memories.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 rounded-md bg-primary text-white font-medium hover:opacity-90"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-md border border-primary text-primary font-medium hover:bg-primary/10"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
