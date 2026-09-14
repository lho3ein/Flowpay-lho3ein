import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import { getLatestRate } from "@/lib/exchange-rate.service";
import { rateQuerySchema } from "@/validations/rate.schema";

export const runtime = "nodejs";

export const GET = withAuth(async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const parsed = rateQuerySchema.safeParse({
    base: searchParams.get("base"),
    quote: searchParams.get("quote"),
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

  const { base, quote } = parsed.data;

  if (base === quote) {
    return NextResponse.json(
      { error: "SAME_CURRENCY", message: "ارز مبدأ و مقصد یکسان است" },
      { status: 400 },
    );
  }

  const currencies = await prisma.currency.findMany({
    where: { code: { in: [base, quote] }, isActive: true },
    select: { id: true, code: true, name: true, symbol: true, decimalPlaces: true },
  });

  const baseCurrency = currencies.find((c) => c.code === base);
  const quoteCurrency = currencies.find((c) => c.code === quote);

  if (!baseCurrency || !quoteCurrency) {
    return NextResponse.json(
      { error: "INVALID_CURRENCY", message: "ارز یافت نشد" },
      { status: 404 },
    );
  }

  const latest = await getLatestRate(base, quote);

  if (!latest) {
    return NextResponse.json(
      { error: "EXCHANGE_RATE_NOT_FOUND", message: "نرخ تبدیل موجود نیست" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    rate: {
      baseCode: base,
      quoteCode: quote,
      rate: latest.rate.toFixed(10),
      validFrom: latest.validFrom.toISOString(),
    },
  });
});