"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type Props = {
  albumId: string;
  name: string;
};

export default function RenameAlbumButton({ albumId, name }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const handleRename = async () => {
    try {
      const newName = window.prompt("Rename album", name)?.trim();
      if (!newName || newName === name) return;
      const res = await fetch("/api/albums/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: albumId, name: newName }),
      });
      const json = await res.json();
      if (!json?.ok) {
        toast({
          variant: "destructive",
          title: json?.error ?? "Rename failed",
        });
        return;
      }
      toast({ title: "Album renamed" });
      router.refresh();
    } catch (err) {
      console.error("Rename error", err);
      toast({ variant: "destructive", title: "Rename failed" });
    }
  };

  return (
    <button
      onClick={handleRename}
      title="Rename album"
      className="px-2 py-1 rounded-md border text-sm flex items-center justify-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="inline-block"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    </button>
  );
}
