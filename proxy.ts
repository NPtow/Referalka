import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/profile(.*)", "/requests(.*)", "/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/marketplace") && process.env.NEXT_PUBLIC_SHOW_MARKETPLACE !== "true") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/for-you") && process.env.NEXT_PUBLIC_SHOW_FOR_YOU !== "true") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
