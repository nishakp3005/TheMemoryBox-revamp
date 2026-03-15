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
    const newName = String(body?.name ?? "").trim();

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    if (!newName)
      return NextResponse.json({ error: "Missing name" }, { status: 400 });

    const album = await prisma.album.findUnique({ where: { id } });
    if (!album)
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    if (album.userId !== session.user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.album.update({
      where: { id },
      data: { name: newName, updatedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Rename album error", err);
    return NextResponse.json(
      { error: "Failed to rename album" },
      { status: 500 },
    );
  }
}
