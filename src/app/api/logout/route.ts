import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const response = NextResponse.redirect(`${baseUrl}/admin/login`);

  // Clear the cookie
  response.cookies.set("admin-password", "", {
    path: "/",
    maxAge: -1,
  });

  return response;
}
