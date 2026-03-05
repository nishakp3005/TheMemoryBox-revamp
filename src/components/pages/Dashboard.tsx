"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
// Link and sidebar icons removed — sidebar is now global
import { Button } from "@/components/ui/button";
import { LogOut, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
// Logo moved to Sidebar component

const sampleImages = [
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
  "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&q=80",
  "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=800&q=80",
  "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&q=80",
  "https://images.unsplash.com/photo-1507149833265-60c372daea22?w=800&q=80",
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80",
  "https://images.unsplash.com/photo-1511407397940-d57f68e81203?w=800&q=80",
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80",
];

type Props = {
  username?: string;
  userEmail?: string;
};
const Dashboard: React.FC<Props> = () => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [previews, setPreviews] = useState<
    Array<{ url: string; type: string; token?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { toast } = useToast();

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
                    url?: string;
                    resourceType?: string;
                    token?: string;
                  }>;
                  error?: string;
                }
              | undefined;

            if (uploadsJson?.ok && Array.isArray(uploadsJson.results)) {
              const ups = uploadsJson.results.map((r) => ({
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

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      toast({ title: "Signed out successfully" });
      router.replace("/login");
    } catch (error) {
      console.error("Error signing out", error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "There was a problem signing out",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      {/* Main content */}
      <main className="">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <input
                type="date"
                className="bg-stone-800 border border-stone-700 text-stone-200 px-3 py-2 rounded-md"
              />
              <Button className="bg-pink-500 hover:bg-pink-600 border-0">
                Select Images
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  // Prevent uploading files that are too large client-side
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
                        description:
                          json?.error ?? "Server rejected the upload",
                      });
                      // dismiss after a short delay
                      setTimeout(() => uploadingToast?.dismiss?.(), 3000);
                      return;
                    }

                    const newPreviews: Array<{
                      url: string;
                      type: string;
                      token?: string;
                    }> = Array.isArray(json.results)
                      ? json.results.map((r) => ({
                          url: String(r.url ?? ""),
                          type:
                            r.resourceType === "video" ||
                            (r.url && String(r.url).match(/\.(mp4|webm|ogg)$/i))
                              ? "video"
                              : "image",
                          token: r.token,
                        }))
                      : [];
                    setPreviews((p) => [...newPreviews, ...p]);
                    uploadingToast?.update?.({
                      id: uploadingToast.id,
                      title: "Upload complete",
                      description: `${json.results?.length ?? 0} file(s) uploaded successfully`,
                    });
                    setTimeout(() => uploadingToast?.dismiss?.(), 1200);

                    // refresh the page to show persisted uploads
                    try {
                      // `refresh()` exists on Next's `useRouter()` in the app router.
                      // Use a safe unknown cast and call it if available.
                      const maybeRouter = router as unknown as {
                        refresh?: () => void;
                      };
                      if (typeof maybeRouter.refresh === "function") {
                        maybeRouter.refresh();
                      } else {
                        window.location.reload();
                      }
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

              <Button variant="ghost" onClick={() => inputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Upload a Memory
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <>
                    <LogOut className="mr-2 h-4 w-4 animate-spin" /> Signing
                    out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Gallery - simple masonry columns */}
        <section className="columns-1 sm:columns-2 md:columns-5 gap-4 space-y-4">
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
                }> =
                  previews.length > 0
                    ? previews
                    : sampleImages.concat(sampleImages).map((s) => ({
                        url: s,
                        type: "image",
                        token: undefined,
                      }));

                return items.map((p, idx) => (
                  <div
                    key={idx}
                    className="break-inside-avoid mb-4 rounded-lg overflow-hidden relative"
                  >
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

                    {/* Action overlay */}
                    <div className="absolute top-2 right-2 flex gap-2">
                      {p.token ? (
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (!p.token) return;
                            setModalLoading(true);
                            try {
                              const res = await fetch(
                                `/api/uploads/asset?token=${encodeURIComponent(
                                  p.token!,
                                )}`,
                              );
                              const j = await res.json();
                              if (j?.url) {
                                setModalUrl(j.url);
                              } else {
                                toast({
                                  variant: "destructive",
                                  title: "Could not load image",
                                  description: j?.error ?? "Server error",
                                });
                              }
                            } catch (err) {
                              console.error("Fetch asset error", err);
                              toast({
                                variant: "destructive",
                                title: "Could not load image",
                              });
                            } finally {
                              setModalLoading(false);
                            }
                          }}
                        >
                          View
                        </Button>
                      ) : null}

                      {p.token ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            if (!p.token) return;
                            if (
                              !confirm(
                                "Delete this asset? This cannot be undone.",
                              )
                            )
                              return;
                            try {
                              const res = await fetch(
                                `/api/uploads/asset?token=${encodeURIComponent(
                                  p.token,
                                )}`,
                                { method: "DELETE", credentials: "include" },
                              );
                              const j = await res.json();
                              if (!j?.ok) {
                                toast({
                                  variant: "destructive",
                                  title: "Delete failed",
                                  description:
                                    j?.error ?? "Server rejected delete",
                                });
                                return;
                              }

                              // remove from previews
                              setPreviews((cur) =>
                                cur.filter((_, i) => i !== idx),
                              );
                              toast({ title: "Deleted" });
                            } catch (err) {
                              console.error("Delete error", err);
                              toast({
                                variant: "destructive",
                                title: "Delete failed",
                              });
                            }
                          }}
                        >
                          Delete
                        </Button>
                      ) : null}
                    </div>
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
