"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function CreateEmptyAlbumButton() {
  const router = useRouter();
  const { toast } = useToast();

  const handleCreate = async () => {
    try {
      const defaultName = "Untitled album";
      const name = window.prompt("Album name:", defaultName)?.trim() ?? "";
      if (!name) {
        toast({ variant: "destructive", title: "Album name required" });
        return;
      }

      const protect = window.confirm("Password protect this album?");
      let password: string | null = null;
      if (protect) {
        password = window.prompt("Enter a password for this album:", "");
        if (!password) {
          toast({ variant: "destructive", title: "Password required" });
          return;
        }
      }

      const body: any = { name };
      if (protect) {
        body.isProtected = true;
        body.password = password;
      }

      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json?.ok) {
        toast({
          variant: "destructive",
          title: json?.error ?? "Could not create album",
        });
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
      className="px-4 py-2 rounded-md bg-pink-500 hover:bg-pink-600 text-white shadow-sm transition-colors duration-150"
    >
      Create new album
    </button>
  );
}
