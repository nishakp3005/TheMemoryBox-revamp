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
    const id = String(body?.id ?? "");
    const password =
      typeof body?.password === "string" ? String(body.password) : null;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const album = await prisma.album.findUnique({ where: { id } });
    if (!album)
      return NextResponse.json({ error: "Album not found" }, { status: 404 });

    // If protected, require password verification
    if (album.isProtected) {
      if (!password)
        return NextResponse.json(
          { error: "Password required" },
          { status: 400 },
        );
      const salt = album.passwordSalt ?? "";
      const hash = crypto
        .createHmac("sha256", salt)
        .update(password)
        .digest("hex");
      if (hash !== album.passwordHash) {
        return NextResponse.json(
          { error: "Incorrect password. Please try again." },
          { status: 401 },
        );
      }
    }

    // return uploads
    const uploads = await prisma.upload.findMany({
      where: { albumId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ok: true, uploads });
  } catch (err) {
    console.error("View album error", err);
    return NextResponse.json(
      { error: "Failed to view album" },
      { status: 500 },
    );
  }
}
