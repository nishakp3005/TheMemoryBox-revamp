"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type Props = { albumId: string };
type ProtectedUpload = {
  id: string;
  url: string;
  publicId?: string | null;
};

export default function ProtectedAlbumContent({ albumId }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState<ProtectedUpload[] | null>(null);
  const verify = async () => {
    if (!password.trim()) {
      toast({ variant: "destructive", title: "Password required" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/albums/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: albumId, password }),
      });
      const json = await res.json();
      if (!json?.ok) {
        toast({
          variant: "destructive",
          title: json?.error ?? "Incorrect password. Please try again.",
        });
        setLoading(false);
        return;
      }
      setUploads(
        (Array.isArray(json.uploads) ? json.uploads : []) as ProtectedUpload[],
      );
    } catch (err) {
      console.error("Verify album password", err);
      toast({ variant: "destructive", title: "Failed to verify" });
    } finally {
      setLoading(false);
    }
  };

  if (uploads) {
    return (
      <div>
        {uploads.length === 0 ? (
          <div className="text-stone-400">No photos in this album yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploads.map((u) => (
              <a
                key={u.id}
                href={u.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded"
              >
                <img
                  src={u.url}
                  alt={u.publicId ?? "photo"}
                  className="w-full h-40 object-cover"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }
  // Modal dialog for entering password
  return (
    <div>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
        <div className="w-full max-w-md p-6 bg-white dark:bg-stone-900 rounded shadow relative">
          <button
            onClick={() => router.back()}
            aria-label="Close"
            className="absolute top-3 right-3 text-stone-500 hover:text-stone-700 dark:text-stone-300"
          >
            ✕
          </button>
          <h3 className="text-lg font-semibold mb-2 text-stone-900 dark:text-stone-100">
            This album is password protected
          </h3>
          <p className="mb-4 text-stone-600 dark:text-stone-300">
            Enter password to view contents.
          </p>
          <div className="flex gap-2">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="flex-1 px-3 py-2 border rounded bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              placeholder="Password"
              onKeyDown={(e) => {
                if (e.key === "Enter") verify();
              }}
            />
            <button
              onClick={verify}
              className="px-3 py-2 rounded bg-pink-500 hover:bg-pink-600 text-white"
              disabled={loading}
            >
              {loading ? "Checking..." : "Unlock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
