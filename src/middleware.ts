import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // ✅ ถ้าไม่มี token เลย (ยังไม่ login)
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // ================= ADMIN =================
    if (pathname.startsWith("/admin")) {
      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // ================= EMPLOYEE =================
    if (pathname.startsWith("/employee")) {
      if (token.role !== "EMPLOYEE") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // ต้อง login ก่อน
    },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*"],
};
