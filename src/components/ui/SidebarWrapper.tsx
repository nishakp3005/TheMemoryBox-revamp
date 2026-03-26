"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";

export default function SidebarWrapper() {
  const pathname = usePathname();

  // Hide sidebar on public/auth routes where the landing or auth UI should be full-bleed
  const hiddenPaths = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  if (!pathname) return null;

  // If the current pathname exactly matches one of the hidden paths, don't render the sidebar
  if (hiddenPaths.includes(pathname)) return null;

  return <Sidebar />;
}
