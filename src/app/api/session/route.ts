import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return NextResponse.json({ user: session?.user ?? null });
  } catch (err) {
    console.log("Error fetching session:", err);
    return NextResponse.json({ user: null });
  }
}
