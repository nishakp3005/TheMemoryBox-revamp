"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function CreateEmptyAlbumButton() {
  const router = useRouter();
  const { toast } = useToast();

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled album" }),
      });
      const json = await res.json();
      if (!json?.ok) {
        toast({ variant: "destructive", title: "Could not create album" });
        return;
      }
      const id = json.album?.id;
      if (id) router.push(`/albums/${id}`);
      else router.push("/albums");
    } catch (err) {
      console.error("Create album error", err);
      toast({ variant: "destructive", title: "Create album failed" });
    }
  };

  return (
    <button
      onClick={handleCreate}
      className="px-4 py-2 rounded-md bg-slate-700 text-white"
    >
      Create new album
    </button>
  );
}
