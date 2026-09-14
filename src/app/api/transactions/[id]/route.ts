import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { AuthError, requireUserId } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      select: {
        id: true,
        type: true,
        status: true,
        sourceAmount: true,
        fee: true,
        exchangeRate: true,
        destinationAmount: true,
        createdAt: true,
        fromCurrency: {
          select: { code: true, symbol: true, decimalPlaces: true, name: true },
        },
        toCurrency: {
          select: { code: true, symbol: true, decimalPlaces: true, name: true },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "TRANSACTION_NOT_FOUND", message: "تراکنش یافت نشد" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      transaction: {
        ...transaction,
        sourceAmount: transaction.sourceAmount.toString(),
        fee: transaction.fee.toString(),
        exchangeRate: transaction.exchangeRate.toString(),
        destinationAmount: transaction.destinationAmount.toString(),
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "ابتدا وارد شوید" },
        { status: 401 },
      );
    }
    throw error;
  }
}