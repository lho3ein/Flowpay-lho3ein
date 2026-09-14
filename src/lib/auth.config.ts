import type { NextAuthConfig } from "next-auth";

/**
 * تنظیمات مشترک Auth (بدون Provider ها) که هم در سمت سرور و هم در Midleware
 * (Proxy) قابل استفاده باشد.
 */
export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const protectedPaths = ["/dashboard", "/wallets", "/exchange", "/transactions"];
      const isProtected = protectedPaths.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
      );
      const isGuestOnly = pathname === "/login" || pathname === "/register";

      if (isProtected && !isLoggedIn) return false;
      if (isGuestOnly && isLoggedIn) return false;
      return true;
    },
  },
} satisfies NextAuthConfig;