// middleware.ts - Next.js 16 edge middleware for role-based access control
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Edge middleware untuk proteksi dashboard berdasarkan role user
 * Dijalankan di CDN edge untuk response time minimal
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    
    // Jika tidak ada token, izinkan withAuth menangani redirect ke login
    if (!token) {
      return NextResponse.next();
    }

    const role = token.role;

    // 1. Proteksi Admin Dashboard - hanya ADMIN
    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. Proteksi Writer Dashboard - WRITER atau ADMIN
    if (
      pathname.startsWith("/dashboard/writer") &&
      role !== "WRITER" &&
      role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Hanya izinkan user yang sudah authenticated
      authorized: ({ token }) => {
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

/**
 * Matcher untuk middleware - hanya jalankan di path dashboard
 * Mencegah middleware overhead pada routes lainnya
 */
export const config = {
  matcher: ["/dashboard/:path*"],
};

