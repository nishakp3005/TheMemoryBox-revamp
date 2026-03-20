import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const hd = await headers();
    const session = await auth.api.getSession({
      headers: hd as unknown as HeadersInit,
    });
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json().catch(() => null)) as {
      uploadIds?: string[];
    } | null;
    const uploadIds: string[] = Array.isArray(body?.uploadIds)
      ? body!.uploadIds.map(String)
      : [];

    if (uploadIds.length === 0)
      return NextResponse.json({ error: "No upload ids" }, { status: 400 });

    const updateResult = await prisma.upload.updateMany({
      where: { id: { in: uploadIds }, userId: session.user.id },
      data: { albumId: null, updatedAt: new Date() },
    });

    return NextResponse.json({ ok: true, removedCount: updateResult.count });
  } catch (err) {
    console.error("Remove album association error", err);
    return NextResponse.json(
      { error: "Failed to remove album association" },
      { status: 500 },
    );
  }
}
