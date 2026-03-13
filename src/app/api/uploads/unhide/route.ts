import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { verifyUploadToken } from "@/lib/uploadUtils";

export async function POST(req: Request) {
  try {
    const hd = await headers();
    const session = await auth.api.getSession({
      headers: hd as unknown as HeadersInit,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as {
      tokens?: string[];
    } | null;
    const tokens = Array.isArray(body?.tokens)
      ? body.tokens.filter((t) => typeof t === "string" && t.trim().length > 0)
      : [];

    if (tokens.length === 0) {
      return NextResponse.json(
        { error: "No upload tokens provided" },
        { status: 400 },
      );
    }

    const publicIds = new Set<string>();

    for (const token of tokens) {
      const payload = verifyUploadToken(token);
      if (!payload) continue;
      if (payload.userId !== session.user.id) continue;
      publicIds.add(payload.publicId);
    }

    if (publicIds.size === 0) {
      return NextResponse.json(
        { error: "No valid uploads to restore" },
        { status: 400 },
      );
    }

    const updateResult = await prisma.upload.updateMany({
      where: {
        userId: session.user.id,
        publicId: { in: Array.from(publicIds) },
      },
      data: {
        isHidden: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      restoredCount: updateResult.count,
    });
  } catch (err) {
    console.error("Restore uploads error", err);
    return NextResponse.json(
      { error: "Failed to restore uploads" },
      { status: 500 },
    );
  }
}
