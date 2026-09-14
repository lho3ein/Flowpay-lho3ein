import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export class AuthError extends Error {
  constructor() {
    super("UNAUTHORIZED");
    this.name = "AuthError";
  }
}

export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new AuthError();
  return userId;
}

type AuthHandler = (req: NextRequest, userId: string) => Promise<NextResponse>;

export function withAuth(handler: AuthHandler) {
  return async (req: NextRequest) => {
    try {
      const userId = await requireUserId();
      return await handler(req, userId);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: "UNAUTHORIZED", message: "ابتدا وارد شوید" },
          { status: 401 },
        );
      }
      console.error(error);
      return NextResponse.json(
        { error: "INTERNAL", message: "خطای داخلی سرور" },
        { status: 500 },
      );
    }
  };
}