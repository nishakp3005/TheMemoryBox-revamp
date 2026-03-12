"use client";
import React from "react";
import Link from "next/link";

type Props = {
  id: string;
  name: string;
  thumb?: string | null;
};

export default function AlbumTile({ id, name, thumb }: Props) {
  return (
    <div className="block p-4 border rounded-md hover:shadow">
      <Link href={`/albums/${id}`} className="flex flex-col">
        <div className="w-full h-40 bg-stone-100 rounded overflow-hidden mb-3">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400">
              No photo
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="font-medium text-lg">{name}</div>
        </div>
      </Link>
    </div>
  );
}
