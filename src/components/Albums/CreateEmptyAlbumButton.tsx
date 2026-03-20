"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function CreateEmptyAlbumButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdAlbumId, setCreatedAlbumId] = useState<string | null>(null);
  const [showPostCreate, setShowPostCreate] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const reset = () => {
    setName("");
    setIsProtected(false);
    setPassword("");
    setSubmitting(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({ variant: "destructive", title: "Album name required" });
      return;
    }
    if (isProtected && password.trim().length < 1) {
      toast({ variant: "destructive", title: "Password required" });
      return;
    }

    try {
      setSubmitting(true);
      const body: any = { name: trimmedName };
      if (isProtected) {
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
        setSubmitting(false);
        return;
      }
      const id = json.album?.id;
      reset();
      setOpen(false);
      setCreatedAlbumId(id ?? null);
      setShowPostCreate(true);
    } catch (err) {
      console.error("Create album error", err);
      toast({ variant: "destructive", title: "Create album failed" });
      setSubmitting(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!createdAlbumId) {
      toast({ variant: "destructive", title: "Album id missing" });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) fd.append("files", f as File);
      const uploadingToast = toast({
        title: "Uploading...",
        description: `${files.length} file(s)`,
      });
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const json = await res.json();
      if (!json?.ok) {
        uploadingToast?.update?.({
          id: uploadingToast.id,
          title: "Upload failed",
        });
        setUploading(false);
        return;
      }
      const ids: string[] = Array.isArray(json.results)
        ? json.results.map((r: any) => String(r.id ?? ""))
        : [];
      if (ids.length > 0) {
        await fetch(`/api/albums/${encodeURIComponent(createdAlbumId)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploadIds: ids }),
        });
      }
      uploadingToast?.update?.({
        id: uploadingToast.id,
        title: "Upload complete",
      });
      setTimeout(() => uploadingToast?.dismiss?.(), 1200);
      router.push(`/albums/${createdAlbumId}`);
    } catch (err) {
      console.error("Post-create upload error", err);
      toast({ variant: "destructive", title: "Upload failed" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowPostCreate(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-md bg-pink-500 hover:bg-pink-600 text-white shadow-sm transition-colors duration-150"
      >
        Create new album
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-stone-800 p-6 rounded shadow-lg w-full max-w-md"
          >
            <h3 className="text-lg font-semibold mb-2 text-stone-900 dark:text-stone-100">
              Create album
            </h3>

            <label className="block text-sm mb-2 text-stone-700 dark:text-stone-300">
              Album name
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-stone-300 dark:border-stone-700"
                placeholder="Album name"
              />
            </label>

            <div className="flex items-center gap-3 mb-3">
              <div className="text-sm text-stone-700 dark:text-stone-300">
                Password protection
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-sm text-stone-900 dark:text-stone-100">
                  <input
                    type="radio"
                    name="protect"
                    checked={!isProtected}
                    onChange={() => setIsProtected(false)}
                  />
                  No
                </label>
                <label className="flex items-center gap-1 text-sm text-stone-900 dark:text-stone-100">
                  <input
                    type="radio"
                    name="protect"
                    checked={isProtected}
                    onChange={() => setIsProtected(true)}
                  />
                  Yes
                </label>
              </div>
            </div>

            {isProtected && (
              <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300">
                Password
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="w-full mt-1 px-3 py-2 border rounded bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-stone-300 dark:border-stone-700"
                  placeholder="Password"
                />
              </label>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-1 rounded border bg-white text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-pink-500 hover:bg-pink-600 text-white"
                disabled={
                  submitting ||
                  name.trim().length === 0 ||
                  (isProtected && password.trim().length === 0)
                }
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
      {showPostCreate && createdAlbumId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-stone-800 p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2 text-stone-900 dark:text-stone-100">
              Album created
            </h3>
            <p className="text-sm text-stone-700 dark:text-stone-300 mb-4">
              What would you like to do next?
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />

            <div className="flex flex-col gap-3">
              <button
                onClick={triggerFileSelect}
                className="w-full px-3 py-2 rounded bg-pink-500 hover:bg-pink-600 text-white"
                disabled={uploading}
              >
                Upload from Local Machine
              </button>

              <button
                onClick={() => {
                  setShowPostCreate(false);
                  router.push(
                    `/dashboard?selectForAlbum=true&albumId=${createdAlbumId}`,
                  );
                }}
                className="w-full px-3 py-2 rounded border bg-white text-stone-900 dark:bg-stone-800 dark:text-stone-100"
              >
                Select from Dashboard
              </button>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowPostCreate(false);
                    router.push(
                      createdAlbumId ? `/albums/${createdAlbumId}` : "/albums",
                    );
                  }}
                  className="px-3 py-1 rounded bg-pink-500 hover:bg-pink-600 text-white"
                >
                  Go to album
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
