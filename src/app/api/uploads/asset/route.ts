import { NextResponse } from "next/server";
import { headers } from "next/headers";
import cloudinary from "@/lib/cloudinary";
import { verifyUploadToken } from "@/lib/uploadUtils";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token)
      return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const payload = verifyUploadToken(token);
    if (!payload)
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });

    // Look up the saved secure URL from the database. The stored URL includes
    // versions/extensions which avoids Cloudinary 404s for some public IDs.
    const upload = await prisma.upload.findFirst({
      where: { publicId: payload.publicId, userId: payload.userId },
    });

    if (!upload) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // If caller requested raw image proxying/redirect, allow using only the signed token
    // (this enables direct view links without requiring cookie-based session)
    // e.g. /api/uploads/asset?token=...&raw=1
    if (url.searchParams.get("raw") === "1") {
      return NextResponse.redirect(upload.url);
    }

    // For the JSON response (non-raw), require an authenticated session as before
    const hd = await headers();
    const session = await auth.api.getSession({
      headers: hd as unknown as Headers,
    });
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.id !== payload.userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({ url: upload.url });
  } catch (err) {
    console.error("Asset error", err);
    return NextResponse.json({ error: "Failed to get asset" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token)
      return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const payload = verifyUploadToken(token);
    if (!payload)
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });

    const hd = await headers();
    const session = await auth.api.getSession({
      headers: hd as unknown as Headers,
    });
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.id !== payload.userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Lookup the DB record to get the stored URL and resource type
    const upload = await prisma.upload.findFirst({
      where: { publicId: payload.publicId, userId: session.user.id },
    });

    if (!upload) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Cloudinary destroy does not accept `auto` for resource_type.
    // Use stored resourceType (fallback to 'image').
    let resourceType = (upload.resourceType || "image").toString();
    const allowed = ["image", "video", "raw", "javascript", "css"];
    if (!allowed.includes(resourceType)) resourceType = "image";

    // Attempt to destroy the Cloudinary asset
    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(
        upload.publicId,
        { resource_type: resourceType },
        (err: unknown) => {
          if (err) return reject(err);
          resolve();
        },
      );
    });

    // Remove DB record(s) belonging to this user and publicId
    await prisma.upload.deleteMany({
      where: { publicId: payload.publicId, userId: session.user.id },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Asset delete error", err);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 },
    );
  }
}
