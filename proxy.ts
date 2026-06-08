import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/admin", "/client"];
const cookieName = "portfolio_session";

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "local-development-secret-change-me");
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(cookieName)?.value;
  if (!token) {
    return NextResponse.redirect(new URL(`/login?next=${pathname}`, request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret());
    if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/client", request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL(`/login?next=${pathname}`, request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/client/:path*"]
};
