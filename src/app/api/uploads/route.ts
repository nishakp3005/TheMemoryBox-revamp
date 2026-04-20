import { NextResponse } from "next/server";
import { headers } from "next/headers";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { encodeUploadToken } from "@/lib/uploadUtils";
import { auth } from "@/lib/auth";
import { Readable } from "stream";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const hd = await headers();
    const session = await auth.api.getSession({
      headers: hd as unknown as HeadersInit,
    });
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const files: File[] = [];
    for (const [, value] of formData.entries()) {
      if (value instanceof File) files.push(value);
      else if (Array.isArray(value)) {
        // ignore
      }
    }

    if (files.length === 0)
      return NextResponse.json({ error: "No files" }, { status: 400 });

    const results: Array<{
      id?: string;
      token: string;
      publicId: string;
      url: string;
      resourceType: string;
    }> = [];

    for (const file of files) {
      // Stream the file to Cloudinary to avoid buffering large files in memory
      const webStream = file.stream();

      const nodeReadable = new Readable({
        read() {},
      });
      const reader = webStream.getReader();
      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            nodeReadable.push(Buffer.from(value));
          }
        } catch (e) {
          nodeReadable.destroy(e as Error);
        } finally {
          nodeReadable.push(null);
        }
      })();

      // Use Cloudinary authenticated upload so images are not publicly accessible
      const publicIdForFile = `users/${session.user.id}/${randomUUID()}`;
      const streamUpload = () =>
        new Promise<Record<string, unknown>>((resolve, reject) => {
          const cb = (error: unknown, result?: Record<string, unknown>) => {
            if (error) return reject(error);
            resolve(result ?? {});
          };
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              type: "authenticated",
              public_id: publicIdForFile,
              unique_filename: false,
              overwrite: false,
            },
            cb,
          );
          nodeReadable.pipe(uploadStream);
        });

      // Retry once on transient network reset
      let upload: Record<string, unknown> = {};
      try {
        upload = await streamUpload();
      } catch (err: unknown) {
        const errObj =
          typeof err === "object" && err !== null
            ? (err as Record<string, unknown>)
            : {};
        console.warn("Upload failed, retrying once:", errObj.code ?? err);
        if ((errObj.code as string) === "ECONNRESET") {
          try {
            upload = await streamUpload();
          } catch (err2) {
            throw err2;
          }
        } else {
          throw err;
        }
      }

      const created = await prisma.upload.create({
        data: {
          userId: session.user.id,
          publicId: upload.public_id as string,
          url: upload.url as string,
          secureUrl: upload.secure_url as string,
          resourceType: upload.resource_type as string,
          createdAt: new Date(),
        },
      });

      const token = encodeUploadToken({
        publicId: upload.public_id as string,
        userId: session.user.id,
      });
      results.push({
        id: created.id,
        token,
        publicId: upload.public_id as string,
        url: upload.secure_url as string,
        resourceType: upload.resource_type as string,
      });
    }

    return NextResponse.json({ ok: true, results });
  } catch (err: unknown) {
    console.error("Upload error", err);
    // Cloudinary returns http_code (e.g. 413 for payload too large)
    // Detect and surface a helpful status to the client
    let code: number | undefined;
    if (typeof err === "object" && err !== null) {
      const e = err as Record<string, unknown>;
      const httpCode = e.http_code ?? e.statusCode ?? e.status;
      if (typeof httpCode === "number") code = httpCode;
      if (typeof httpCode === "string")
        code = parseInt(httpCode, 10) || undefined;
    }
    if (code === 413) {
      return NextResponse.json(
        { error: "Upload rejected: file too large" },
        { status: 413 },
      );
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const hd = await headers();
    const session = await auth.api.getSession({
      headers: hd as unknown as HeadersInit,
    });
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reqUrl = new URL(req.url);
    const hiddenParam = reqUrl.searchParams.get("hidden");
    const onlyHidden = hiddenParam === "only";

    // Query all user uploads, then apply hidden filter in JS so legacy Mongo
    // records without an explicit isHidden field are treated as visible.
    const uploadsAll = await prisma.upload.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    const uploads = uploadsAll.filter((u) =>
      onlyHidden ? u.isHidden === true : u.isHidden !== true,
    );

    // Return uploads (url, resourceType) and a time-limited token for the authenticated user
    // Use secureUrl when available, fall back to legacy url for older records.
    const results = uploads.map((u) => ({
      id: u.id,
      publicId: u.publicId,
      url: u.secureUrl ?? u.url,
      resourceType: u.resourceType,
      createdAt: u.createdAt,
      token: encodeUploadToken({
        publicId: u.publicId,
        userId: session.user.id,
      }),
    }));

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error("Uploads list error", err);
    return NextResponse.json(
      { error: "Failed to fetch uploads" },
      { status: 500 },
    );
  }
}
