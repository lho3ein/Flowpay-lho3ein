import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validations/auth.schema";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "INVALID_INPUT",
          message: parsed.error.issues[0]?.message ?? "داده ورودی نامعتبر است",
        },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "EMAIL_TAKEN", message: "این ایمیل قبلاً ثبت شده است" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name,
        passwordHash,
      },
    });

    // برای کاربر جدید، کیف پول همه ارزهای فعال با موجودی صفر ساخته می‌شود
    const currencies = await prisma.currency.findMany({ where: { isActive: true } });
    await prisma.wallet.createMany({
      data: currencies.map((c) => ({
        userId: user.id,
        currencyId: c.id,
        balance: "0",
      })),
    });

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "INTERNAL", message: "خطای داخلی سرور" },
      { status: 500 },
    );
  }
}