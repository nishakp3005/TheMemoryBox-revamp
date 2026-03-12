import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";

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
          <h1 className="text-2xl font-bold">{album.name}</h1>
          <p className="text-stone-400 mt-2">{album.uploads.length} photos</p>
        </div>
        <div>
          <Link href="/albums">
            <button className="px-3 py-1 rounded-md border">Back</button>
          </Link>
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
