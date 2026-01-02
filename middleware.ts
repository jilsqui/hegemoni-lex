// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const pathname = req.nextUrl.pathname;

    // 1. Cegah Pembaca/Writer masuk ke Admin Dashboard
    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. Cegah Pembaca masuk ke Writer Dashboard
    if (pathname.startsWith("/dashboard/writer") && role !== "WRITER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Pastikan user sudah login dulu
    },
  }
);

// Tentukan halaman mana saja yang dijaga satpam
export const config = {
  matcher: ["/dashboard/:path*"], 
};