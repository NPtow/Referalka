import { NextResponse } from "next/server";

function isLegacyUserRoute(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/companies" ||
    pathname.startsWith("/companies/") ||
    pathname === "/requests" ||
    pathname.startsWith("/requests/")
  );
}

export default async function proxy(req: Request) {
  const url = new URL(req.url);
  const { pathname } = url;

  if (isLegacyUserRoute(pathname)) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  if (pathname.startsWith("/marketplace") && process.env.NEXT_PUBLIC_SHOW_MARKETPLACE !== "true") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/for-you") && process.env.NEXT_PUBLIC_SHOW_FOR_YOU !== "true") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
