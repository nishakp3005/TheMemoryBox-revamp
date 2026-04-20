import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import AlbumTile from "@/components/Albums/AlbumTile";
import CreateEmptyAlbumButton from "@/components/Albums/CreateEmptyAlbumButton";

export default async function AlbumsPage() {
  const hd = await headers();
  const session = await auth.api.getSession({
    headers: hd as unknown as HeadersInit,
  });
  if (!session?.user) redirect("/login");

  const albums = await prisma.album.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      uploads: { take: 3, orderBy: { createdAt: "asc" } },
      _count: { select: { uploads: true } },
    },
  });

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Albums</h1>
          <p className="text-stone-400 mt-2">
            Your photo albums will appear here.
          </p>
        </div>
        <div>
          {/* Create an empty album then navigate to its page */}
          <CreateEmptyAlbumButton />
        </div>
      </div>

      {albums.length === 0 ? (
        <div className="text-stone-400">
          No albums yet. Create your first album.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {albums.map((a) => {
            const photos = a.uploads ? a.uploads.map((u) => u.url) : [];
            const count = a._count?.uploads ?? photos.length;
            const createdAtLabel = a.createdAt
              ? new Date(a.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;

            return (
              <AlbumTile
                key={a.id}
                id={a.id}
                name={a.name}
                photos={photos}
                count={count}
                createdAtLabel={createdAtLabel}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
