import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/auth",
  "/api/auth/",
  "/api/session",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/public",
  "/sitemap.xml",
];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    return true;
  }
  // allow static files
  if (pathname.match(/\.(png|jpg|jpeg|svg|css|js|map|ico)$/)) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  try {
    // call internal session endpoint with forwarded cookies to verify session
    const sessionRes = await fetch(
      new URL("/api/session", req.url).toString(),
      {
        headers: { cookie: req.headers.get("cookie") || "" },
        cache: "no-store",
      },
    );

    if (!sessionRes.ok) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const data = await sessionRes.json();
    if (!data?.user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    // on any error, redirect to login (safe fallback)
    console.error("Middleware error", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: "/((?!_next/static|_next/image|assets|public).*)",
};
