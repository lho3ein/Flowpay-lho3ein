import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const protectedPaths = ["/dashboard", "/wallets", "/exchange", "/transactions"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isProtected = protectedPaths.some(
    (p) => nextUrl.pathname === p || nextUrl.pathname.startsWith(`${p}/`),
  );
  const isGuestOnly =
    nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isGuestOnly && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};