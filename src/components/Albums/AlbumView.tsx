"use client";
import React, { useEffect, useState } from "react";
import UploadToAlbumButton from "@/components/Albums/UploadToAlbumButton";
import Link from "next/link";
import DeleteAlbumSection from "@/components/Albums/DeleteAlbumSection";
import AlbumGallery from "./AlbumGallery";
import { useToast } from "@/hooks/use-toast";

type UploadItem = { id: string; url: string; publicId?: string };

export default function AlbumView({
  albumId,
  albumName,
  uploads,
}: {
  albumId: string;
  albumName: string;
  uploads: UploadItem[];
}) {
  const [items, setItems] = useState<UploadItem[]>(uploads);
  useEffect(() => setItems(uploads), [uploads]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const removeSelected = async () => {
    if (selected.size === 0) return;
    try {
      const sel = Array.from(selected).sort((a, b) => a - b);
      const uploadIds = sel.map((i) => items[i]?.id).filter(Boolean);
      if (uploadIds.length === 0) {
        toast({ title: "No uploads selected" });
        return;
      }
      const res = await fetch(`/api/albums/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: albumId, uploadIds }),
      });
      const json = await res.json();
      if (!json?.ok) {
        toast({
          variant: "destructive",
          title: json?.error ?? "Remove failed",
        });
        return;
      }
      setItems((cur) => cur.filter((_, idx) => !selected.has(idx)));
      setSelected(new Set());
      toast({ title: "Removed from album" });
    } catch (err) {
      console.error("Bulk remove error", err);
      toast({ variant: "destructive", title: "Remove failed" });
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    const ok = confirm(
      `Delete ${selected.size} selected photo(s)? This cannot be undone.`,
    );
    if (!ok) return;
    try {
      // fetch user's uploads to get tokens
      const uploadsRes = await fetch(`/api/uploads`);
      const uploadsJson = (await uploadsRes.json()) as {
        results?: Array<{ id?: string; token?: string }>;
      };
      const tokenById: Record<string, string> = {};
      for (const u of uploadsJson?.results || []) {
        if (u?.id && u?.token) tokenById[u.id] = u.token;
      }

      const sel = Array.from(selected).sort((a, b) => a - b);
      const uploadIds = sel.map((i) => items[i]?.id).filter(Boolean);
      const failed: string[] = [];

      for (const id of uploadIds) {
        const token = tokenById[id];
        if (!token) {
          failed.push(id);
          continue;
        }
        const res = await fetch(
          `/api/uploads/asset?token=${encodeURIComponent(token)}`,
          {
            method: "DELETE",
          },
        );
        if (!res.ok) failed.push(id);
      }

      setItems((cur) => cur.filter((u) => !uploadIds.includes(u.id)));
      setSelected(new Set());
      if (failed.length > 0) {
        toast({
          variant: "destructive",
          title: `Deleted with ${failed.length} failures`,
        });
      } else {
        toast({ title: "Deleted selected photos" });
      }
    } catch (err) {
      console.error("Bulk delete error", err);
      toast({ variant: "destructive", title: "Delete failed" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{albumName}</h1>
          <p className="text-stone-400 mt-2">{items.length} photos</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 ? (
            <>
              <div className="text-stone-200">{selected.size} selected</div>
              <button
                className="px-3 py-1 rounded bg-pink-500 text-white"
                onClick={() => {
                  if (selected.size < items.length)
                    setSelected(new Set(items.map((_, i) => i)));
                  else setSelected(new Set());
                }}
              >
                {selected.size < items.length ? "Select all" : "Deselect all"}
              </button>
              <button
                className="px-3 py-1 rounded bg-pink-500 text-white"
                onClick={removeSelected}
                disabled={selected.size === 0}
              >
                Remove from album
              </button>
              <button
                className="px-3 py-1 rounded bg-red-600 text-white"
                onClick={deleteSelected}
                disabled={selected.size === 0}
              >
                Delete selected
              </button>
            </>
          ) : (
            <>
              <UploadToAlbumButton
                albumId={albumId}
                className="px-3 py-1 rounded-md bg-pink-500 hover:bg-pink-600 text-white"
              />
              <Link href={`/dashboard?selectForAlbum=true&albumId=${albumId}`}>
                <button className="px-3 py-1 rounded-md bg-pink-500 hover:bg-pink-600 text-white">
                  Select from dashboard
                </button>
              </Link>
              <DeleteAlbumSection albumId={albumId} albumName={albumName} />
              <Link href="/albums">
                <button className="px-3 py-1 rounded-md bg-pink-500 hover:bg-pink-600 text-white">
                  Back
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      <AlbumGallery
        uploads={items}
        selected={selected}
        setSelected={setSelected}
      />
    </div>
  );
}
