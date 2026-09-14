import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api";
import { computeQuote, hasExcessFractionDigits } from "@/lib/exchange";
import { getLatestRate } from "@/lib/exchange-rate.service";
import { quoteQuerySchema } from "@/validations/exchange.schema";

export const runtime = "nodejs";

export const GET = withAuth(async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const parsed = quoteQuerySchema.safeParse({
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    amount: searchParams.get("amount"),
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

  const { from, to, amount } = parsed.data;

  if (from === to) {
    return NextResponse.json(
      { error: "SAME_CURRENCY", message: "ارز مبدأ و مقصد یکسان است" },
      { status: 400 },
    );
  }

  const currencies = await prisma.currency.findMany({
    where: { code: { in: [from, to] }, isActive: true },
  });

  const fromCurrency = currencies.find((c) => c.code === from);
  const toCurrency = currencies.find((c) => c.code === to);

  if (!fromCurrency || !toCurrency) {
    return NextResponse.json(
      { error: "INVALID_CURRENCY", message: "ارز یافت نشد" },
      { status: 404 },
    );
  }

  if (hasExcessFractionDigits(amount, fromCurrency.decimalPlaces)) {
    return NextResponse.json(
      {
        error: "INVALID_AMOUNT",
        message: `مبلغ نمی‌تواند بیش از ${fromCurrency.decimalPlaces} رقم اعشار داشته باشد`,
      },
      { status: 400 },
    );
  }

  const latest = await getLatestRate(from, to);

  if (!latest) {
    return NextResponse.json(
      { error: "EXCHANGE_RATE_NOT_FOUND", message: "نرخ تبدیل موجود نیست" },
      { status: 404 },
    );
  }

  const quote = computeQuote(
    amount,
    latest.rate,
    fromCurrency.decimalPlaces,
    toCurrency.decimalPlaces,
  );

  return NextResponse.json({
    quote: {
      sourceAmount: quote.sourceAmount.toFixed(fromCurrency.decimalPlaces),
      fee: quote.fee.toFixed(fromCurrency.decimalPlaces),
      destinationAmount: quote.destinationAmount.toFixed(
        toCurrency.decimalPlaces,
      ),
      rate: quote.rate.toFixed(10),
      validFrom: latest.validFrom.toISOString(),
    },
    source: {
      code: fromCurrency.code,
      name: fromCurrency.name,
      symbol: fromCurrency.symbol,
      decimalPlaces: fromCurrency.decimalPlaces,
    },
    target: {
      code: toCurrency.code,
      name: toCurrency.name,
      symbol: toCurrency.symbol,
      decimalPlaces: toCurrency.decimalPlaces,
    },
  });
});