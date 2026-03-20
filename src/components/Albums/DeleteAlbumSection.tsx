"use client";
import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type Props = { albumId: string; albumName: string };

export default function DeleteAlbumSection({ albumId, albumName }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setConfirmName("");
    }
  }, [open]);

  const doDelete = async () => {
    try {
      const res = await fetch("/api/albums/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: albumId, confirmName }),
      });
      const json = await res.json();
      if (!json?.ok) {
        const err = String(json?.error ?? "Could not delete album");
        if (err === "Confirmation name does not match") {
          toast({
            variant: "destructive",
            title:
              "Album name does not match. Please enter the correct album name",
          });
        } else {
          toast({ variant: "destructive", title: err });
        }
        return;
      }
      toast({ title: "Album deleted" });
      router.replace("/albums");
    } catch (err) {
      console.error("Delete album failed", err);
      toast({ variant: "destructive", title: "Delete failed" });
    }
  };

  return (
    <div className="inline-block">
      <button
        className="px-3 py-1 rounded-md bg-pink-500 hover:bg-pink-600 text-white mr-2"
        onClick={() => setOpen(true)}
      >
        Delete album
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-stone-800 p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2 text-stone-900 dark:text-stone-100">
              Delete album
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 mb-4">
              Type the album name to confirm deletion.
            </p>
            <input
              ref={inputRef}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const trimmed = confirmName.trim();
                  if (trimmed === albumName) {
                    doDelete();
                  } else {
                    toast({
                      variant: "destructive",
                      title:
                        "Album name does not match. Please enter the correct album name",
                    });
                    setConfirmName("");
                    // focus the input after clearing
                    setTimeout(() => {
                      (inputRef.current as HTMLInputElement | null)?.focus();
                    }, 50);
                  }
                }
              }}
              className="w-full px-3 py-2 border rounded mb-4 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-stone-300 dark:border-stone-700"
              placeholder="Album name"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-red-600 text-white"
                onClick={doDelete}
                disabled={confirmName.trim() !== albumName}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
