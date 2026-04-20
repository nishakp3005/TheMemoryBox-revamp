import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import ProtectedAlbumContent from "@/components/Albums/ProtectedAlbumContent";
import AlbumView from "@/components/Albums/AlbumView";
// client-side delete UI is implemented in a separate client component

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AlbumDetailPage({ params }: Params) {
  const hd = await headers();
  const session = await auth.api.getSession({
    headers: hd as unknown as HeadersInit,
  });
  if (!session?.user) redirect("/login");

  const { id } = await params;

  // If album is protected, do not load uploads server-side.
  const album = await prisma.album.findUnique({ where: { id } });
  let uploads: Awaited<ReturnType<typeof prisma.upload.findMany>> = [];
  if (album && !album.isProtected) {
    uploads = await prisma.upload.findMany({
      where: { albumId: id },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!album) {
    return (
      <main className="min-h-screen p-6">
        <div className="text-red-500">Album not found.</div>
        <div className="mt-4">
          <Link href="/albums" className="text-sky-600">
            Back to albums
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      {album.isProtected ? (
        <ProtectedAlbumContent albumId={album.id} />
      ) : uploads.length === 0 ? (
        <div className="text-stone-400">No photos in this album yet.</div>
      ) : (
        <AlbumView
          albumId={album.id}
          albumName={album.name}
          uploads={uploads.map((u) => ({
            id: String(u.id),
            url: String(u.url),
            publicId: String(u.publicId ?? ""),
          }))}
        />
      )}
    </main>
  );
}
