"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";

export default function DashboardHeader() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      toast({ title: "Signed out successfully", description: "You have been signed out successfully." });
      router.push("/login");
    } catch {
      toast({ variant: "destructive", title: "error signing out", description: "there is a problem signing out" });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="flex items-center">
            <div className="text-lg font-semibold bungee">ORA</div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <input aria-label="Search" placeholder="Search..." className="border rounded-md px-3 py-1 w-full focus:outline-none" />
            </div>
          </div>

          <div className="flex justify-end items-center gap-3">
            <Button variant="ghost">Notifications</Button>
            <Button variant="ghost">Help</Button>
            <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
              {isSigningOut ? (
                <>
                  <LogOut className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
