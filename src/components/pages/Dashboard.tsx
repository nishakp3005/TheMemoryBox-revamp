"use client";
import React, { useState, useEffect } from "react";
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
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/session");
        const json = await res.json();
        if (mounted && !json?.user) {
          router.replace("/login");
        }
      } catch (err) {
        // on error, be conservative and redirect to login
        console.error("Error checking session:", err);
        if (mounted) router.replace("/login");
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
              <Button variant="ghost" onClick={() => {}}>
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
          {sampleImages.concat(sampleImages).map((src, idx) => (
            <div
              key={idx}
              className="break-inside-avoid mb-4 rounded-lg overflow-hidden"
            >
              {src.startsWith("/") ? (
                <Image
                  src={src}
                  alt={`img-${idx}`}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={`img-${idx}`}
                  className="w-full h-auto object-cover"
                />
              )}
            </div>
          ))}
        </section>
      </main>
    </>
  );
};

export default Dashboard;
