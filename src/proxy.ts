import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const path = request.nextUrl.pathname;
  const role = token?.role;

  if (!token && (path.startsWith("/author-dashboard") || path.startsWith("/admin-dashboard"))) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (path.startsWith("/author-dashboard") && role !== "AUTHOR") {
    return NextResponse.redirect(new URL("/admin-dashboard", request.url));
  }
  if (path.startsWith("/admin-dashboard") && !["ADMIN", "SUPERADMIN"].includes(String(role))) {
    return NextResponse.redirect(new URL("/author-dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/author-dashboard/:path*", "/admin-dashboard/:path*"],
};
