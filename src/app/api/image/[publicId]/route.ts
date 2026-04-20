import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { auth } from "@/lib/auth";

// Simple in-memory cache for signed URLs (short lived)
const signedUrlCache = new Map<string, { url: string; expires: number }>();

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  try {
    const { publicId } = await params;
    if (!publicId) return new Response("Not found", { status: 404 });

    const hd = await headers();
    const session = await auth.api.getSession({
      headers: hd as unknown as HeadersInit,
    });
    if (!session?.user) return new Response("Unauthorized", { status: 403 });

    // Lookup upload record
    const upload = await prisma.upload.findUnique({ where: { publicId } });
    if (!upload) return new Response("Not found", { status: 404 });

    // Only allow owner (or extend with album/shared logic)
    if (upload.userId !== session.user.id)
      return new Response("Forbidden", { status: 403 });

    // Parse transformation params
    const urlObj = new URL(request.url);
    const w = urlObj.searchParams.get("w");
    const h = urlObj.searchParams.get("h");
    const crop = urlObj.searchParams.get("crop") ?? "limit"; // default

    const cacheKey = `${publicId}:${w ?? ""}:${h ?? ""}:${crop}`;
    const now = Date.now();
    const cached = signedUrlCache.get(cacheKey);
    if (cached && cached.expires > now) {
      return new Response(null, {
        status: 302,
        headers: { Location: cached.url },
      });
    }

    // Build Cloudinary transformation
    const transformation: Record<string, unknown> = {};
    if (w) transformation.width = Number(w);
    if (h) transformation.height = Number(h);
    if (crop) transformation.crop = crop;

    // Generate a signed URL for authenticated delivery (server-side only)
    const signedUrl = cloudinary.url(upload.publicId, {
      resource_type: "image",
      type: "authenticated",
      secure: true,
      sign_url: true,
      transformation: Object.keys(transformation).length
        ? [transformation]
        : undefined,
    });

    // Cache short-lived
    signedUrlCache.set(cacheKey, {
      url: signedUrl,
      expires: now + 1000 * 60 * 5,
    });

    return new Response(null, {
      status: 302,
      headers: { Location: signedUrl },
    });
  } catch (err) {
    console.error("Image route error", err);
    return new Response("Server error", { status: 500 });
  }
}
