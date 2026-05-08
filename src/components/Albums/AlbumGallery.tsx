"use client";
import React, { useEffect, useState } from "react";
import ImageViewer from "@/components/ui/ImageViewer";

type UploadItem = {
  id: string;
  url: string;
  publicId?: string;
  resourceType?: string;
  token?: string;
};

export default function AlbumGallery({
  uploads,
  selected,
  setSelected,
}: {
  uploads: UploadItem[];
  selected: Set<number>;
  setSelected: React.Dispatch<React.SetStateAction<Set<number>>>;
}) {
  const [items, setItems] = useState<UploadItem[]>(uploads);

  useEffect(() => setItems(uploads), [uploads]);

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if ((ev.ctrlKey || ev.metaKey) && (ev.key === "a" || ev.key === "A")) {
        ev.preventDefault();
        setSelected(new Set(items.map((_, i) => i)));
      }
      if (ev.key === "Escape") setSelected(new Set());
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [items, setSelected]);

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  return (
    <div>
      <section className="columns-1 sm:columns-2 md:columns-5 gap-4 space-y-4">
        {items.map((u, idx) => (
          <div
            key={u.id}
            className={`group break-inside-avoid mb-4 rounded-lg overflow-hidden relative cursor-pointer ${selected.has(idx) ? "ring-4 ring-offset-0 ring-[#F15087]" : ""}`}
            onClick={() => setViewerIndex(idx)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={u.url}
              alt={u.publicId ?? "photo"}
              className="w-full h-auto object-cover"
            />

            <div
              className={`absolute top-2 left-2 z-10 transition-opacity ${selected.has(idx) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <label className="flex items-center justify-center w-6 h-6 rounded-full bg-black/60 border border-stone-700 text-stone-200 hover:bg-stone-700/60 transition-colors">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selected.has(idx)}
                  onChange={(e) => {
                    if (e.target.checked)
                      setSelected((cur) => new Set(cur).add(idx));
                    else
                      setSelected((cur) => {
                        const n = new Set(cur);
                        n.delete(idx);
                        return n;
                      });
                  }}
                />
                <span
                  className={`pointer-events-none w-4 h-4 rounded-full border border-stone-300 flex items-center justify-center text-xs transition-colors ${selected.has(idx) ? "bg-[#F15087] text-white border-[#F15087]" : ""}`}
                >
                  {selected.has(idx) ? "✓" : ""}
                </span>
              </label>
            </div>
          </div>
        ))}
      </section>

      <ImageViewer
        items={items.map((i) => ({ id: i.id, url: i.url, token: i.token }))}
        index={viewerIndex}
        onIndexChange={(next) => setViewerIndex(next)}
      />
    </div>
  );
}
