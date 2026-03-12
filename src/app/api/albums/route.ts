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
    const name = String(body?.name ?? "").trim();
    const uploadIds: string[] = Array.isArray(body?.uploadIds)
      ? body.uploadIds.map(String)
      : [];

    if (!name)
      return NextResponse.json(
        { error: "Missing album name" },
        { status: 400 },
      );

    // create album
    const album = await prisma.album.create({
      data: {
        userId: session.user.id,
        name,
        createdAt: new Date(),
      },
    });

    // assign uploads (only those belonging to user)
    if (uploadIds.length > 0) {
      await prisma.upload.updateMany({
        where: { id: { in: uploadIds }, userId: session.user.id },
        data: { albumId: album.id },
      });
    }

    return NextResponse.json({ ok: true, album });
  } catch (err) {
    console.error("Create album error", err);
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const hd = await headers();
    const session = await auth.api.getSession({
      headers: hd as unknown as HeadersInit,
    });
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const albums = await prisma.album.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ok: true, albums });
  } catch (err) {
    console.error("Albums list error", err);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 },
    );
  }
}
