import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

const PROTECTED_ROUTES = ["/profile", "/requests", "/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect hidden routes to home
  if (pathname.startsWith("/marketplace") && process.env.NEXT_PUBLIC_SHOW_MARKETPLACE !== "true") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname.startsWith("/for-you") && process.env.NEXT_PUBLIC_SHOW_FOR_YOU !== "true") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Auth protection for protected routes
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/", request.url));

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/profile/:path*", "/requests/:path*", "/dashboard/:path*", "/marketplace/:path*", "/for-you/:path*"],
};
