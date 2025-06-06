import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const cookie = req.cookies.get("admin-password")?.value;

  // Only protect /admin routes EXCEPT /admin/login
  if (
    req.nextUrl.pathname.startsWith("/admin") &&
    req.nextUrl.pathname !== "/admin/login"
  ) {
    if (cookie !== adminPassword) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
