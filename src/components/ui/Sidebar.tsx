"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Folder, Clock, Gift, Bell } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function Sidebar() {
  const [username, setUsername] = useState<string | null>(null);

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
        // ignore
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
      <div className="mb-6">
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

        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-sm text-stone-400">
            A collection of your memories
          </p>
        </div>
      </div>
    </aside>
  );
}
