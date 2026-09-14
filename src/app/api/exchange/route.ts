import { NextRequest, NextResponse } from "next/server";

import { withAuth } from "@/lib/api";
import { ExchangeError, exchangeErrorStatus } from "@/lib/errors";
import { executeExchange } from "@/lib/exchange.service";
import { exchangeSchema } from "@/validations/exchange.schema";

export const runtime = "nodejs";

export const POST = withAuth(async (req: NextRequest, userId: string) => {
  const body = await req.json().catch(() => null);
  const parsed = exchangeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "INVALID_INPUT",
        message: parsed.error.issues[0]?.message ?? "داده ورودی نامعتبر است",
      },
      { status: 400 },
    );
  }

  try {
    const result = await executeExchange({
      userId,
      fromCode: parsed.data.fromCode,
      toCode: parsed.data.toCode,
      sourceAmount: parsed.data.sourceAmount,
      idempotencyKey: parsed.data.idempotencyKey,
    });

    return NextResponse.json(
      {
        transaction: result.transaction,
        replayed: result.replayed,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ExchangeError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: exchangeErrorStatus(error.code) },
      );
    }
    throw error;
  }
});