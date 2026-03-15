import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import DeleteAlbumSection from "@/components/Albums/DeleteAlbumSection";
import UploadToAlbumButton from "@/components/Albums/UploadToAlbumButton";
import RenameAlbumButton from "@/components/Albums/RenameAlbumButton";
// client-side delete UI is implemented in a separate client component

type Params = {
  params: {
    id: string;
  };
};

export default async function AlbumDetailPage({ params }: Params) {
  const hd = await headers();
  const session = await auth.api.getSession({
    headers: hd as unknown as HeadersInit,
  });
  if (!session?.user) redirect("/login");

  const { id } = (await params) as unknown as { id: string };

  const album = await prisma.album.findUnique({
    where: { id },
    include: { uploads: { orderBy: { createdAt: "desc" } } },
  });

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{album.name}</h1>
            <RenameAlbumButton albumId={album.id} name={album.name} />
          </div>
          <p className="text-stone-400 mt-2">{album.uploads.length} photos</p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <UploadToAlbumButton albumId={album.id} />
            <Link href={`/dashboard?selectForAlbum=true&albumId=${album.id}`}>
              <button className="px-3 py-1 rounded-md border">
                Select from dashboard
              </button>
            </Link>
            <DeleteAlbumSection albumId={album.id} albumName={album.name} />
            <RenameAlbumButton albumId={album.id} name={album.name} />
            <Link href="/albums">
              <button className="px-3 py-1 rounded-md border">Back</button>
            </Link>
          </div>
        </div>
      </div>

      {album.uploads.length === 0 ? (
        <div className="text-stone-400">No photos in this album yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {album.uploads.map((u) => (
            <a
              key={u.id}
              href={u.url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded"
            >
              <img
                src={u.url}
                alt={u.publicId ?? "photo"}
                className="w-full h-40 object-cover"
              />
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
