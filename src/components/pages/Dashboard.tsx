"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import {products} from "@/lib/products";
import { Bungee } from "next/font/google";

const Dashboard = () => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out successfully.",
      });
      router.push("/login");
    } catch {
      toast({
        variant: "destructive",
        title: "error signing out",
        description: "there is a problem signing out",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  // Use product data from src/lib/products.ts

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav - primary */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="flex items-center">
              <div className="text-lg font-semibold bungee">ORA</div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <input
                  aria-label="Search"
                  placeholder="Search..."
                  className="border rounded-md px-3 py-1 w-full focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end items-center gap-3">
              <Button variant="ghost">Notifications</Button>
              <Button variant="ghost">Help</Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
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

          {/* Top nav - secondary subtitles */}
          <div className="mt-2 border-t">
            <nav className="max-w-7xl mx-auto px-4 py-2 flex justify-center gap-8 text-sm text-slate-700">
              <button className="hover:text-slate-900">Pack of 1 x 30ml</button>
              <button className="hover:text-slate-900">Pack of 1 x 100ml</button>
              <button className="hover:text-slate-900">Pack of 2 x 30ml</button>
              <button className="hover:text-slate-900">Pack of 4 x 30ml</button>
              <button className="hover:text-slate-900">Air Freshners</button>
              <button className="hover:text-slate-900">Car Freshners</button>
              <button className="hover:text-slate-900">Dhahab Attars</button>
              <button className="hover:text-slate-900">Pocket Perfumes</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Left sidebar with filters */}
        <aside className="w-64 hidden md:block">
          <div className="space-y-4">
            <section className="bg-white border rounded-md p-4">
              <div className="font-medium mb-2">Filters</div>
              <div className="space-y-2 text-sm">
                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>Only active</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>Has reports</span>
                  </label>
                </div>
                <div>
                  <label className="block">
                    <span className="text-xs text-slate-600">Status</span>
                    <select className="mt-1 block w-full border rounded-md px-2 py-1 text-sm">
                      <option>Any</option>
                      <option>Open</option>
                      <option>Closed</option>
                    </select>
                  </label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 bg-slate-100 px-2 py-1 rounded">
                    Apply
                  </button>
                  <button className="flex-1 bg-white border px-2 py-1 rounded">
                    Clear
                  </button>
                </div>
              </div>
            </section>
          </div>
        </aside>

        {/* Content area */}
        <section className="flex-1">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => {
              const discounted =
                p.discount > 0 ? (p.price * (100 - p.discount)) / 100 : p.price;
              return (
                <article
                  key={p.id}
                  className="bg-white border rounded-md p-4 shadow-sm"
                >
                  <h2 className="font-semibold mb-2">{p.name}</h2>
                  <p className="text-sm text-slate-600 mb-3">{p.description}</p>
                  <div className="overflow-hidden rounded-md mb-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-40 w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-slate-100 px-2 py-1 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      {p.discount > 0 ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-semibold">
                            ${discounted.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-500 line-through">
                            ${p.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-green-600 ml-2">
                            -{p.discount}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-semibold">
                          ${p.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div>
                      <Button variant="ghost">Open</Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
