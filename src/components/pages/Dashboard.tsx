"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
// Link and sidebar icons removed — sidebar is now global
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
// Logo moved to Sidebar component

// const sampleImages = [
//   "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
//   "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&q=80",
//   "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=800&q=80",
//   "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&q=80",
//   "https://images.unsplash.com/photo-1507149833265-60c372daea22?w=800&q=80",
//   "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
//   "https://images.unsplash.com/photo-1511407397940-d57f68e81203?w=800&q=80",
//   "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80",
// ];

type Props = {
  username?: string;
  userEmail?: string;
};
type ServerUpload = {
  id?: string;
  url?: string;
  resourceType?: string;
  token?: string;
};
const Dashboard: React.FC<Props> = () => {
  const [previews, setPreviews] = useState<
    Array<{ id?: string; url: string; type: string; token?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [albumName, setAlbumName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const selectMode = Boolean(searchParams?.get("selectForAlbum"));

  // Use the actual return type of the `toast` helper so our casts match
  // the implementation in `src/hooks/use-toast.ts`.
  type ToastController = ReturnType<typeof toast> | undefined;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/session");
        const json = await res.json();
        if (mounted && !json?.user) {
          router.replace("/login");
        }
        // If user is signed in, fetch their uploads to show on dashboard
        if (mounted && json?.user) {
          try {
            const uploadsRes = await fetch("/api/uploads");
            const uploadsJson = (await uploadsRes.json()) as
              | {
                  ok?: boolean;
                  results?: Array<{
                    id?: string;
                    url?: string;
                    resourceType?: string;
                    token?: string;
                  }>;
                  error?: string;
                }
              | undefined;

            if (uploadsJson?.ok && Array.isArray(uploadsJson.results)) {
              const ups = uploadsJson.results.map((r) => ({
                id: String(r.id ?? ""),
                url: String(r.url ?? ""),
                type:
                  r.resourceType === "video" ||
                  (r.url && String(r.url).match(/\.(mp4|webm|ogg)$/i))
                    ? "video"
                    : "image",
                token: r.token,
              }));
              setPreviews(ups);
            }
          } catch (err) {
            console.error("Error fetching uploads", err);
          }
        }
        setLoading(false);
      } catch (err) {
        // on error, be conservative and redirect to login
        console.error("Error checking session:", err);
        if (mounted) router.replace("/login");
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  // Keyboard handlers: Escape to clear selection, Ctrl/Cmd+A to select all
  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      // Ctrl/Cmd + A => select all
      if ((ev.ctrlKey || ev.metaKey) && (ev.key === "a" || ev.key === "A")) {
        ev.preventDefault();
        if (previews.length > 0) {
          setSelected(new Set(previews.map((_, i) => i)));
        }
        return;
      }

      // Escape => clear selection
      if (ev.key === "Escape" && selected.size > 0) {
        setSelected(new Set());
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [selected, previews]);

  return (
    <>
      {/* Main content */}
      <main
        className=""
        onClick={(e) => {
          // clicking the top-level main background (not an item) should clear selection
          if (selected.size > 0 && e.target === e.currentTarget)
            setSelected(new Set());
        }}
      >
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4" />
            {/* hidden file input (always present) */}
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB
                for (const f of Array.from(files)) {
                  if (f.size > MAX_UPLOAD_BYTES) {
                    toast({
                      variant: "destructive",
                      title: "File too large",
                      description: `Each file must be < ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB`,
                    });
                    if (inputRef.current) inputRef.current.value = "";
                    return;
                  }
                }
                const fd = new FormData();
                for (const f of Array.from(files)) fd.append("files", f);

                try {
                  const uploadingToast = toast({
                    title: "Uploading...",
                    description: `Uploading ${files.length} file(s)`,
                  }) as ToastController;

                  const res = await fetch("/api/uploads", {
                    method: "POST",
                    body: fd,
                  });
                  const json = (await res.json()) as {
                    ok?: boolean;
                    results?: Array<{
                      id?: string;
                      url?: string;
                      resourceType?: string;
                      token?: string;
                    }>;
                    error?: string;
                  };

                  if (!json?.ok) {
                    uploadingToast?.update?.({
                      id: uploadingToast.id,
                      title: "Upload failed",
                      description: json?.error ?? "Server rejected the upload",
                    });
                    setTimeout(() => uploadingToast?.dismiss?.(), 3000);
                    return;
                  }

                  const newPreviews: Array<{
                    id?: string;
                    url: string;
                    type: string;
                    token?: string;
                  }> = Array.isArray(json.results)
                    ? json.results.map((r) => ({
                        id: String(r.id ?? ""),
                        url: String(r.url ?? ""),
                        type:
                          r.resourceType === "video" ||
                          (r.url && String(r.url).match(/\.(mp4|webm|ogg)$/i))
                            ? "video"
                            : "image",
                        token: r.token,
                      }))
                    : [];

                  // Prepend new uploads. If in select-mode, auto-select the newly uploaded items
                  setPreviews((p) => {
                    const combined = [...newPreviews, ...p];
                    // update selection to shift existing indexes and include new ones
                    if (selectMode && newPreviews.length > 0) {
                      setSelected((cur) => {
                        const next = new Set<number>();
                        // shift existing selections by newPreviews length
                        for (const idx of cur)
                          next.add(idx + newPreviews.length);
                        // select all newly uploaded
                        for (let i = 0; i < newPreviews.length; i++)
                          next.add(i);
                        return next;
                      });
                    }
                    return combined;
                  });
                  uploadingToast?.update?.({
                    id: uploadingToast.id,
                    title: "Upload complete",
                    description: `${json.results?.length ?? 0} file(s) uploaded successfully`,
                  });
                  setTimeout(() => uploadingToast?.dismiss?.(), 1200);

                  try {
                    const maybeRouter = router as unknown as {
                      refresh?: () => void;
                    };
                    if (typeof maybeRouter.refresh === "function")
                      maybeRouter.refresh();
                    else window.location.reload();
                  } catch {
                    window.location.reload();
                  }
                } catch (err) {
                  console.error("Upload error", err);
                  toast({ variant: "destructive", title: "Upload failed" });
                } finally {
                  if (inputRef.current) inputRef.current.value = "";
                }
              }}
            />

            <div className="flex items-center gap-3">
              <div />
              {selectMode ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Album name"
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                    className="bg-stone-800 border border-stone-700 text-stone-200 px-3 py-2 rounded-md"
                  />
                  <Button
                    variant="ghost"
                    onClick={() => inputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Upload
                  </Button>
                  <Button
                    className="bg-[#F15087] text-white hover:bg-[#e03a73]"
                    onClick={async () => {
                      if (!albumName.trim()) {
                        toast({ title: "Please provide an album name" });
                        return;
                      }
                      try {
                        // fetch latest uploads from server to map ids
                        const res = await fetch("/api/uploads");
                        const json = await res.json();
                        const serverResults = Array.isArray(json?.results)
                          ? (json.results as ServerUpload[])
                          : [];
                        const sel = Array.from(selected).sort((a, b) => a - b);
                        const uploadIds: string[] = [];
                        for (const i of sel) {
                          const p = previews[i];
                          if (!p) continue;
                          const match = serverResults.find(
                            (s: ServerUpload) =>
                              (p.token && s.token === p.token) ||
                              (s.url && p.url === s.url),
                          );
                          if (match?.id) uploadIds.push(match.id);
                        }

                        const createRes = await fetch("/api/albums", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: albumName.trim(),
                            uploadIds,
                          }),
                        });
                        const createJson = await createRes.json();
                        if (!createJson?.ok) {
                          toast({
                            variant: "destructive",
                            title: "Could not create album",
                          });
                          return;
                        }
                        toast({ title: "Album created" });
                        router.replace("/albums");
                      } catch (err) {
                        console.error("Create album error", err);
                        toast({
                          variant: "destructive",
                          title: "Create album failed",
                        });
                      }
                    }}
                    disabled={selected.size === 0}
                  >
                    Create album
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/albums")}
                  >
                    Cancel
                  </Button>
                </div>
              ) : selected.size > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="text-stone-200">{selected.size} selected</div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (previews.length === 0) return;
                      if (selected.size < previews.length) {
                        setSelected(new Set(previews.map((_, i) => i)));
                      } else {
                        setSelected(new Set());
                      }
                    }}
                  >
                    {selected.size < previews.length
                      ? "Select all"
                      : "Deselect all"}
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const urls: string[] = [];
                        const sel = Array.from(selected).sort((a, b) => a - b);
                        for (const i of sel) {
                          const p = previews[i];
                          if (!p) continue;
                          if (p.token) {
                            const res = await fetch(
                              `/api/uploads/asset?token=${encodeURIComponent(p.token)}`,
                            );
                            const j = await res.json();
                            if (j?.url) urls.push(j.url);
                          } else if (p.url) {
                            urls.push(p.url);
                          }
                        }
                        if (urls.length === 0) {
                          toast({ title: "No shareable URLs found" });
                          return;
                        }
                        await navigator.clipboard.writeText(urls.join("\n"));
                        toast({ title: "Copied link(s) to clipboard" });
                      } catch (err) {
                        console.error("Share error", err);
                        toast({
                          variant: "destructive",
                          title: "Could not share",
                        });
                      }
                    }}
                  >
                    Share
                  </Button>
                  <Button
                    className="bg-[#F15087] text-white hover:bg-[#e03a73]"
                    onClick={async () => {
                      if (
                        !confirm(
                          "Delete selected assets? This cannot be undone.",
                        )
                      )
                        return;
                      try {
                        const sel = Array.from(selected).sort((a, b) => b - a);
                        for (const i of sel) {
                          const p = previews[i];
                          if (!p) continue;
                          if (p.token) {
                            try {
                              await fetch(
                                `/api/uploads/asset?token=${encodeURIComponent(p.token)}`,
                                { method: "DELETE", credentials: "include" },
                              );
                            } catch (err) {
                              console.error("Delete asset error", err);
                            }
                          }
                        }
                        setPreviews((cur) =>
                          cur.filter((_, idx) => !selected.has(idx)),
                        );
                        setSelected(new Set());
                        toast({ title: "Deleted" });
                      } catch (err) {
                        console.error("Bulk delete error", err);
                        toast({
                          variant: "destructive",
                          title: "Delete failed",
                        });
                      }
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      const name = window.prompt("Create album name:");
                      if (!name || !name.trim()) return;
                      try {
                        const res = await fetch("/api/uploads");
                        const json = await res.json();
                        const serverResults = Array.isArray(json?.results)
                          ? (json.results as ServerUpload[])
                          : [];
                        const sel = Array.from(selected).sort((a, b) => a - b);
                        const uploadIds: string[] = [];
                        for (const i of sel) {
                          const p = previews[i];
                          if (!p) continue;
                          const match = serverResults.find(
                            (s: ServerUpload) =>
                              (p.token && s.token === p.token) ||
                              (s.url && p.url === s.url),
                          );
                          if (match?.id) uploadIds.push(match.id);
                        }
                        const createRes = await fetch("/api/albums", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: name.trim(),
                            uploadIds,
                          }),
                        });
                        const createJson = await createRes.json();
                        if (!createJson?.ok) {
                          toast({
                            variant: "destructive",
                            title: "Could not create album",
                          });
                          return;
                        }
                        toast({ title: "Album created" });
                        router.replace("/albums");
                      } catch (err) {
                        console.error(err);
                        toast({
                          variant: "destructive",
                          title: "Create album failed",
                        });
                      }
                    }}
                    disabled={selected.size === 0}
                  >
                    Create Album
                  </Button>
                  <Button
                    className="bg-[#F15087] text-white hover:bg-[#e03a73]"
                    onClick={() => router.push("/albums")}
                  >
                    Add to Existing Album
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    className="bg-[#F15087] text-white hover:bg-[#e03a73]"
                    onClick={() => inputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4 " /> Upload a Memory
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Gallery - simple masonry columns */}
        <section
          className="columns-1 sm:columns-2 md:columns-5 gap-4 space-y-4"
          onClick={(e) => {
            // clicking empty gallery area should clear selection
            if (selected.size > 0 && e.target === e.currentTarget)
              setSelected(new Set());
          }}
        >
          {loading
            ? Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className="break-inside-avoid mb-4 rounded-lg overflow-hidden bg-stone-800 animate-pulse"
                  style={{ height: 240 }}
                />
              ))
            : (() => {
                const items: Array<{
                  url: string;
                  type: string;
                  token?: string;
                }> = previews;

                if (items.length === 0) {
                  return (
                    <div className="col-span-full py-5 text-center text-stone-400">
                      <p className="text-2xl text-stone-200 mb-2">
                        No memories yet
                      </p>
                    </div>
                  );
                }

                return items.map((p, idx) => (
                  <div
                    key={idx}
                    className={`group break-inside-avoid mb-4 rounded-lg overflow-hidden relative cursor-pointer ${selected.has(idx) ? "ring-4 ring-offset-0 ring-[#F15087]" : ""}`}
                    onClick={async () => {
                      if (selected.size > 0) {
                        setSelected((cur) => {
                          const next = new Set(cur);
                          if (next.has(idx)) next.delete(idx);
                          else next.add(idx);
                          return next;
                        });
                        return;
                      }

                      if (!p) return;
                      if (p.token) {
                        setModalLoading(true);
                        try {
                          const res = await fetch(
                            `/api/uploads/asset?token=${encodeURIComponent(p.token)}`,
                          );
                          const j = await res.json();
                          if (j?.url) setModalUrl(j.url);
                          else
                            toast({
                              variant: "destructive",
                              title: "Could not load image",
                            });
                        } catch (err) {
                          console.error("Fetch asset error", err);
                          toast({
                            variant: "destructive",
                            title: "Could not load image",
                          });
                        } finally {
                          setModalLoading(false);
                        }
                      } else {
                        setModalUrl(p.url);
                      }
                    }}
                  >
                    <div
                      className={`absolute top-2 left-2 z-10 transition-opacity ${selected.size > 0 ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="flex items-center justify-center w-6 h-6 rounded-full bg-black/60 border border-stone-700 text-stone-200 hover:bg-stone-700/60 transition-colors">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selected.has(idx)}
                          onChange={(e) => {
                            setSelected((cur) => {
                              const next = new Set(cur);
                              if (e.target.checked) next.add(idx);
                              else next.delete(idx);
                              return next;
                            });
                          }}
                        />
                        <span
                          className={`pointer-events-none w-4 h-4 rounded-full border border-stone-300 flex items-center justify-center text-xs transition-colors ${selected.has(idx) ? "bg-[#F15087] text-white border-[#F15087]" : ""}`}
                        >
                          {selected.has(idx) ? "✓" : ""}
                        </span>
                      </label>
                    </div>

                    {p.url.startsWith("/") ? (
                      <Image
                        src={p.url}
                        alt={`img-${idx}`}
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.url}
                        alt={`img-${idx}`}
                        className="w-full h-auto object-cover"
                      />
                    )}

                    <div
                      aria-hidden
                      className={`absolute inset-0 pointer-events-none transition-opacity ${selected.has(idx) ? "bg-gray-500/30 opacity-100" : "opacity-0 group-hover:opacity-0"}`}
                    />
                    {/* removed per-photo action buttons; actions now in top bar when selecting */}
                  </div>
                ));
              })()}
        </section>
        {/* Modal / Popup for viewing images */}
        {modalUrl !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setModalUrl(null)}
          >
            <div
              className="max-w-4xl max-h-[90vh] p-4 bg-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {modalLoading ? (
                  <div className="w-[800px] h-[600px] bg-stone-800 animate-pulse" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={modalUrl}
                    alt="preview"
                    className="max-w-full max-h-[80vh] rounded-md shadow-lg"
                  />
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => setModalUrl(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Dashboard;
