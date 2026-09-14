import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import { addWalletSchema } from "@/validations/wallet.schema";

export const runtime = "nodejs";

const walletSelect = {
  id: true,
  balance: true,
  currency: {
    select: {
      id: true,
      code: true,
      name: true,
      symbol: true,
      decimalPlaces: true,
    },
  },
} as const;

export const GET = withAuth(async (_req, userId) => {
  const wallets = await prisma.wallet.findMany({
    where: { userId },
    select: walletSelect,
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ wallets });
});

export const POST = withAuth(async (req, userId) => {
  const body = await req.json().catch(() => null);
  const parsed = addWalletSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "INVALID_INPUT",
        message: parsed.error.issues[0]?.message ?? "داده ورودی نامعتبر است",
      },
      { status: 400 },
    );
  }

  const currencyCode = parsed.data.currencyCode;
  const currency = await prisma.currency.findUnique({
    where: { code: currencyCode },
  });

  if (!currency || !currency.isActive) {
    return NextResponse.json(
      { error: "CURRENCY_NOT_FOUND", message: "ارز موردنظر یافت نشد" },
      { status: 404 },
    );
  }

  const existing = await prisma.wallet.findUnique({
    where: { userId_currencyId: { userId, currencyId: currency.id } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "WALLET_EXISTS", message: "این کیف پول از قبل موجود است" },
      { status: 409 },
    );
  }

  const wallet = await prisma.wallet.create({
    data: { userId, currencyId: currency.id, balance: "0" },
    select: walletSelect,
  });

  return NextResponse.json({ wallet }, { status: 201 });
});