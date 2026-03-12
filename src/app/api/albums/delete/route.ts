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

    const body = await request.json();
    const id = String(body?.id ?? "");
    const confirmName =
      typeof body?.confirmName === "string" ? String(body.confirmName) : null;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const album = await prisma.album.findUnique({ where: { id } });
    if (!album)
      return NextResponse.json({ error: "Album not found" }, { status: 404 });

    // If confirmName provided, require exact match
    if (confirmName !== null && confirmName !== album.name) {
      return NextResponse.json(
        { error: "Confirmation name does not match" },
        { status: 400 },
      );
    }

    // Unlink uploads from album
    await prisma.upload.updateMany({
      where: { albumId: id },
      data: { albumId: null },
    });

    // Delete album
    await prisma.album.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete album error", err);
    return NextResponse.json(
      { error: "Failed to delete album" },
      { status: 500 },
    );
  }
}
