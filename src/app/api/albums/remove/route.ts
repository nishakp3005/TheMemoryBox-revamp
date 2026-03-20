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
      id?: string;
      uploadIds?: string[];
    } | null;
    const id = String(body?.id ?? "");
    const uploadIds: string[] = Array.isArray(body?.uploadIds)
      ? body!.uploadIds.map(String)
      : [];

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (uploadIds.length === 0)
      return NextResponse.json({ error: "No upload ids" }, { status: 400 });

    const album = await prisma.album.findUnique({ where: { id } });
    if (!album)
      return NextResponse.json({ error: "Album not found" }, { status: 404 });

    if (album.userId !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Disassociate the uploads from the album (set albumId to null)
    await prisma.upload.updateMany({
      where: { id: { in: uploadIds }, userId: session.user.id },
      data: { albumId: null, updatedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Remove from album error", err);
    return NextResponse.json(
      { error: "Failed to remove from album" },
      { status: 500 },
    );
  }
}
