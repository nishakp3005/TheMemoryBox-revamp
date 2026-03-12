import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function AlbumsPage() {
  const hd = await headers();
  const session = await auth.api.getSession({
    headers: hd as unknown as HeadersInit,
  });
  if (!session?.user) redirect("/login");

  const albums = await prisma.album.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { uploads: { take: 1, orderBy: { createdAt: "asc" } } },
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
          <Link href="/dashboard?selectForAlbum=true">
            <button className="px-4 py-2 rounded-md bg-slate-700 text-white">
              Create new album
            </button>
          </Link>
        </div>
      </div>

      {albums.length === 0 ? (
        <div className="text-stone-400">
          No albums yet. Create your first album.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {albums.map((a) => {
            const thumb = a.uploads && a.uploads[0] ? a.uploads[0].url : null;
            return (
              <Link
                key={a.id}
                href={`/albums/${a.id}`}
                className="block p-4 border rounded-md hover:shadow"
              >
                <div className="flex flex-col">
                  <div className="w-full h-40 bg-stone-100 rounded overflow-hidden mb-3">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={a.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-lg">{a.name}</div>
                    <div className="text-sm text-stone-400">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
