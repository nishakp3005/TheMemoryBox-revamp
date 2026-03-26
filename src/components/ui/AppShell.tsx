"use client";
import React from "react";
import { usePathname } from "next/navigation";
import SidebarWrapper from "@/components/ui/SidebarWrapper";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Routes where we want the full-bleed landing / auth UI without the dark app shell
  const hiddenPaths = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  const base = "min-h-screen flex";
  const darkClasses = "bg-stone-900 text-stone-100";

  const isHidden = !!pathname && hiddenPaths.includes(pathname);

  const rootClass = isHidden
    ? `${base} h-screen overflow-hidden`
    : `${base} ${darkClasses}`;

  const contentClass = isHidden
    ? "flex-1 h-screen overflow-hidden"
    : "flex-1 p-6";

  return (
    <div className={rootClass}>
      <SidebarWrapper />
      <div className={contentClass}>{children}</div>
    </div>
  );
}
