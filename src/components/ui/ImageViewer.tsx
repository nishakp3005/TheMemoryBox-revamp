"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Item = {
  id?: string;
  url?: string;
  token?: string;
  resourceType?: string;
  type?: string;
};

type UploadAsset = {
  id?: string | number;
  url?: string;
  token?: string;
};

export default function ImageViewer({
  items,
  index,
  onIndexChange,
}: {
  items: Item[];
  index: number | null;
  onIndexChange: (next: number | null) => void;
}) {
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const resolvedCache = useRef<Map<number, string>>(new Map());

  const resolvePreviewUrl = useCallback(
    async (index: number) => {
      const item = items[index];
      if (!item) return null;
      const cached = resolvedCache.current.get(index);
      if (cached) return cached;

      if (item.token) {
        try {
          const res = await fetch(
            `/api/uploads/asset?token=${encodeURIComponent(item.token)}`,
          );
          const j = await res.json();
          if (j?.url) {
            resolvedCache.current.set(index, String(j.url));
            return String(j.url);
          }
        } catch {
          // ignore
        }
      }

      try {
        const allRes = await fetch(`/api/uploads`);
        const allJson = await allRes.json();
        const list: UploadAsset[] = Array.isArray(allJson?.results)
          ? (allJson.results as UploadAsset[])
          : [];
        const match = list.find(
          (s) =>
            String(s.id ?? "") === String(item.id) ||
            String(s.url ?? "") === String(item.url),
        );
        if (match?.token) {
          const res = await fetch(
            `/api/uploads/asset?token=${encodeURIComponent(match.token)}`,
          );
          const j = await res.json();
          if (j?.url) {
            resolvedCache.current.set(index, String(j.url));
            return String(j.url);
          }
        }
      } catch {
        // ignore
      }

      resolvedCache.current.set(index, String(item.url ?? ""));
      return item.url ?? null;
    },
    [items],
  );

  useEffect(() => {
    if (index === null) return;
    let mounted = true;
    (async () => {
      setModalLoading(true);
      setModalUrl(null);
      try {
        const resolved = await resolvePreviewUrl(index);
        if (mounted) setModalUrl(resolved);
      } catch (err) {
        console.error("ImageViewer resolve error", err);
        if (mounted) setModalUrl(null);
      } finally {
        if (mounted) setModalLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [index, resolvePreviewUrl]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onIndexChange(Math.max(0, index - 1));
      if (e.key === "ArrowRight")
        onIndexChange(Math.min(items.length - 1, index + 1));
      if (e.key === "Escape") onIndexChange(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, items.length, onIndexChange]);

  if (index === null) return null;

  const prevDisabled = index <= 0;
  const nextDisabled = index >= items.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={() => onIndexChange(null)}
    >
      <div
        className="max-w-4xl max-h-[90vh] p-4 bg-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {modalLoading && !modalUrl ? (
            <div className="w-[800px] h-[600px] bg-stone-800 animate-pulse" />
          ) : modalUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`modal-image-${index}`}
              src={modalUrl}
              alt="preview"
              className={`max-w-full max-h-[80vh] rounded-md shadow-lg transition-opacity duration-200 ${modalLoading ? "opacity-60" : "opacity-100"}`}
            />
          ) : null}

          <Button
            size="icon"
            variant="ghost"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/35 hover:bg-black/55 text-white disabled:opacity-30"
            onClick={() => onIndexChange(index - 1)}
            disabled={prevDisabled}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/35 hover:bg-black/55 text-white disabled:opacity-30"
            onClick={() => onIndexChange(index + 1)}
            disabled={nextDisabled}
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={() => onIndexChange(null)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
