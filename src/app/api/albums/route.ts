import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import crypto from "crypto";

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
    const isProtected = Boolean(body?.isProtected ?? false);
    const password =
      typeof body?.password === "string" ? String(body.password) : null;

    if (!name)
      return NextResponse.json(
        { error: "Missing album name" },
        { status: 400 },
      );

    // create album (handle optional protection)
    const albumData: {
      userId: string;
      name: string;
      createdAt: Date;
      isProtected?: boolean;
      passwordHash?: string;
      passwordSalt?: string;
    } = {
      userId: session.user.id,
      name,
      createdAt: new Date(),
    };
    if (isProtected) {
      if (!password) {
        return NextResponse.json(
          { error: "Missing password" },
          { status: 400 },
        );
      }
      const salt = crypto.randomBytes(8).toString("hex");
      const hash = crypto
        .createHmac("sha256", salt)
        .update(password)
        .digest("hex");
      albumData.isProtected = true;
      albumData.passwordHash = hash;
      albumData.passwordSalt = salt;
    }

    // create album
    const album = await prisma.album.create({ data: albumData });

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
