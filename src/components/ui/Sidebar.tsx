"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Folder, Clock, Gift, Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import Logo from "@/components/ui/Logo";

export default function Sidebar() {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/session");
        if (!mounted) return;
        if (!res.ok) return;
        const data = await res.json();
        const name = data?.user?.name ?? data?.user?.email ?? null;
        setUsername(name);
      } catch (err) {
        void err;
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const title = username
    ? username.endsWith("s")
      ? `${username}' Photos`
      : `${username}'s Photos`
    : "Your Photos";

  return (
    <aside className="w-72 flex flex-col bg-[#151517] border-r border-stone-800 p-6 sticky top-0 h-screen overflow-auto">
      <div className="mb-6 flex justify-center items-center">
        <Logo width={160} height={56} />
      </div>

      <div className="mt-6 border-t border-stone-800 pt-4 space-y-3">
        <Link
          href="/home"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-800"
        >
          <Home className="h-5 w-5 text-pink-400" />
          <span>Home</span>
        </Link>
        <Link
          href="/albums"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-800"
        >
          <Folder className="h-5 w-5 text-pink-400" />
          <span>Albums</span>
        </Link>
        <Link
          href="/capsules"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-800"
        >
          <Clock className="h-5 w-5 text-pink-400" />
          <span>Capsules</span>
        </Link>
        <Link
          href="/gifts"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-800"
        >
          <Gift className="h-5 w-5 text-pink-400" />
          <span>Gifts</span>
        </Link>
        <Link
          href="/notifs"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-800"
        >
          <Bell className="h-5 w-5 text-pink-400" />
          <span>Notifs</span>
        </Link>

        {/* title moved to bottom to keep nav compact */}
      </div>
      <div className="mt-auto pt-4 border-t border-stone-800">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-stone-200">{title}</h2>
          <button
            onClick={async () => {
              try {
                await authClient.signOut();
                toast({ title: "Signed out" });
                router.replace("/login");
              } catch (err) {
                console.error(err);
                toast({ variant: "destructive", title: "Could not sign out" });
              }
            }}
            className="ml-2 flex items-center gap-2 px-3 py-3 rounded-md bg-stone-200"
          >
            <LogOut className="h-4 w-4 text-pink-400" />
          </button>
        </div>
      </div>
    </aside>
  );
}
