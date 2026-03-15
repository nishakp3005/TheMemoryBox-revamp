"use client";
import React from "react";
import Link from "next/link";

type Props = {
  id: string;
  name: string;
  thumb?: string | null;
  photos?: string[];
  count?: number;
  createdAt?: string | Date | null;
  createdAtLabel?: string | null;
};

function formatDate(d?: string | Date | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  try {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    console.log("Date formatting error", e);
    return String(d);
  }
}

export default function AlbumTile({
  id,
  name,
  thumb,
  photos,
  count,
  createdAt,
  createdAtLabel,
}: Props) {
  const photosList =
    photos && photos.length > 0 ? photos : thumb ? [String(thumb)] : [];
  const total = count ?? photosList.length ?? 0;

  return (
    <div className="block p-0 border rounded-md overflow-visible bg-[#151517] text-stone-200 border-pink-400 shadow-sm transform-gpu will-change-transform transition-shadow duration-200 ease-out hover:shadow-2xl hover:shadow-pink-900/30 hover:scale-105 hover:-translate-y-1 hover:z-10">
      <Link href={`/albums/${id}`} className="flex flex-col">
        <div className="w-full h-44 mb-2 bg-[#151517] rounded-l-md rounded-r-md">
          {photosList.length >= 3 ? (
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1">
              <div className="row-span-2 col-span-1 overflow-hidden rounded-l-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photosList[0]}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-tr-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photosList[1]}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-br-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photosList[2]}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : photosList.length >= 1 ? (
            // single cover
            <div className="w-full h-full overflow-hidden rounded-t-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photosList[0]}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-200 bg-[#151517] rounded-l-md rounded-r-md">
              No photo
            </div>
          )}
        </div>

        <div className="px-4 pb-3">
          <div className="text-left">
            <div className="font-medium text-lg truncate text-white">
              {name}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-stone-300">
            <div>
              {total} {total === 1 ? "photo" : "photos"}
            </div>
            <div className="ml-4">
              {createdAtLabel ?? formatDate(createdAt)}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
