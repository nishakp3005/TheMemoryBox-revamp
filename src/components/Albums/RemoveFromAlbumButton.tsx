"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type Props = { uploadId: string; albumId: string };

export default function RemoveFromAlbumButton({ uploadId, albumId }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const handleRemove = async () => {
    try {
      const res = await fetch(`/api/albums/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: albumId, uploadIds: [uploadId] }),
      });
      const json = await res.json();
      if (!json?.ok) {
        toast({
          variant: "destructive",
          title: json?.error ?? "Remove failed",
        });
        return;
      }
      toast({ title: "Removed from album" });
      router.refresh();
    } catch (err) {
      console.error("Remove from album error", err);
      toast({ variant: "destructive", title: "Remove failed" });
    }
  };

  return (
    <button
      onClick={handleRemove}
      title="Remove from Album"
      className="absolute top-2 right-2 bg-white/90 dark:bg-stone-800/90 hover:bg-white px-2 py-1 rounded text-xs text-stone-900 dark:text-stone-100 shadow"
    >
      Remove
    </button>
  );
}
