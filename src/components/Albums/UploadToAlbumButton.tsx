"use client";
import React, { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type Props = { albumId: string; className?: string };

export default function UploadToAlbumButton({ albumId, className }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
          const files = e.target.files;
          if (!files || files.length === 0) return;
          const fd = new FormData();
          for (const f of Array.from(files)) fd.append("files", f);
          try {
            const uploading = toast({
              title: "Uploading...",
              description: `${files.length} file(s)`,
            });
            const res = await fetch("/api/uploads", {
              method: "POST",
              body: fd,
            });
            const json = await res.json();
            if (!json?.ok) {
              uploading?.update?.({ id: uploading.id, title: "Upload failed" });
              setTimeout(() => uploading?.dismiss?.(), 2000);
              return;
            }
            const ids: string[] = Array.isArray(json.results)
              ? json.results.map((r: any) => String(r.id ?? ""))
              : [];
            if (ids.length > 0) {
              await fetch(`/api/albums/${encodeURIComponent(albumId)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uploadIds: ids }),
              });
            }
            uploading?.update?.({ id: uploading.id, title: "Upload complete" });
            setTimeout(() => uploading?.dismiss?.(), 1200);
            router.replace(`/albums/${albumId}`);
          } catch (err) {
            console.error("Upload to album error", err);
            toast({ variant: "destructive", title: "Upload failed" });
          } finally {
            if (inputRef.current) inputRef.current.value = "";
          }
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className={className ?? "px-3 py-1 rounded-md border mr-2"}
      >
        Upload from computer
      </button>
    </>
  );
}
