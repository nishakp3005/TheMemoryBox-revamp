"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Home,
  Folder,
  Clock,
  Gift,
  Bell,
  Moon,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import Logo from "@/components/ui/Logo";

const sampleImages = [
  "/file.svg",
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
  username: string;
  userEmail?: string;
};

const Dashboard: React.FC<Props> = ({ username, userEmail }) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      toast({ title: "Signed out successfully" });
      router.push("/login");
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
    <div className="min-h-screen flex bg-stone-900 text-stone-100">
      {/* Sidebar */}
      <aside className="w-72 flex flex-col bg-[#151517] border-r border-stone-800 p-6">
        <div className="mb-6">
          <Logo width={160} height={56} />
        </div>

        <nav className="flex-1">
          <div className="text-sm font-semibold mb-4 text-stone-400">
            Platform
          </div>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-800">
              <Home className="h-5 w-5 text-pink-400" />
              <span>Home</span>
            </li>
            <li className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-800">
              <Folder className="h-5 w-5 text-pink-400" />
              <span>Albums</span>
            </li>
            <li className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-800">
              <Clock className="h-5 w-5 text-pink-400" />
              <span>Capsules</span>
            </li>
            <li className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-800">
              <Gift className="h-5 w-5 text-pink-400" />
              <span>Gifts</span>
            </li>
            <li className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-800">
              <Bell className="h-5 w-5 text-pink-400" />
              <span>Notifs</span>
            </li>
          </ul>
        </nav>

        <div className="mt-6 space-y-3">
          <button className="flex items-center gap-3 text-sm text-stone-300 hover:text-white">
            <Moon className="h-4 w-4" /> Change Theme
          </button>
          <button className="flex items-center gap-3 text-sm text-stone-300 hover:text-white">
            <Gift className="h-4 w-4" /> Gift Someone!
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-stone-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center">DP</div>
          <div className="text-sm">
            <div className="font-semibold">{username}</div>
            {userEmail ? <div className="text-xs text-zinc-400">{userEmail}</div> : null}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <header className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{username.endsWith("s") ? `${username}' Photos` : `${username}'s Photos`}</h2>
            <p className="text-sm text-stone-400">
              A collection of your memories
            </p>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="date"
              className="bg-stone-800 border border-stone-700 text-stone-200 px-3 py-2 rounded-md"
            />
            <Button className="bg-pink-500 hover:bg-pink-600 border-0">
              Select Images
            </Button>
          </div>
        </header>

        <div className="mb-6 flex items-center justify-between gap-4">
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

        {/* Gallery - simple masonry columns */}
        <section className="columns-1 sm:columns-2 md:columns-4 gap-4 space-y-4">
          {sampleImages.concat(sampleImages).map((src, idx) => (
            <div
              key={idx}
              className="break-inside-avoid mb-4 rounded-lg overflow-hidden "
            >
              {/* If local asset (starts with /) use next/image else fallback to img */}
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
    </div>
  );
};

export default Dashboard;
