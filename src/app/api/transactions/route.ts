import { NextRequest, NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import { transactionListQuerySchema } from "@/validations/transaction.schema";

export const runtime = "nodejs";

const TX_SELECT = {
  id: true,
  type: true,
  status: true,
  sourceAmount: true,
  fee: true,
  exchangeRate: true,
  destinationAmount: true,
  createdAt: true,
  fromCurrency: { select: { code: true, symbol: true, decimalPlaces: true, name: true } },
  toCurrency: { select: { code: true, symbol: true, decimalPlaces: true, name: true } },
} as const;

export const GET = withAuth(async (req: NextRequest, userId: string) => {
  const { searchParams } = req.nextUrl;
  const parsed = transactionListQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    fromCode: searchParams.get("fromCode") ?? undefined,
    toCode: searchParams.get("toCode") ?? undefined,
    fromDate: searchParams.get("fromDate") ?? undefined,
    toDate: searchParams.get("toDate") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "INVALID_INPUT",
        message: parsed.error.issues[0]?.message ?? "داده ورودی نامعتبر است",
      },
      { status: 400 },
    );
  }

  const { page, limit, status, type, fromCode, toCode, fromDate, toDate } =
    parsed.data;

  const where: Prisma.TransactionWhereInput = { userId };

  if (status) where.status = status;
  if (type) where.type = type;
  if (fromCode) where.fromCurrency = { code: fromCode };
  if (toCode) where.toCurrency = { code: toCode };

  const createdAt: Prisma.DateTimeFilter = {};
  if (fromDate) createdAt.gte = new Date(`${fromDate}T00:00:00.000Z`);
  if (toDate) createdAt.lte = new Date(`${toDate}T23:59:59.999Z`);
  if (fromDate || toDate) where.createdAt = createdAt;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      select: TX_SELECT,
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map((t) => ({
      ...t,
      sourceAmount: t.sourceAmount.toString(),
      fee: t.fee.toString(),
      exchangeRate: t.exchangeRate.toString(),
      destinationAmount: t.destinationAmount.toString(),
    })),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});