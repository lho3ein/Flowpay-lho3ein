import Decimal from "decimal.js";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { computeQuote, type ExchangeQuote } from "@/lib/exchange";
import { ExchangeError } from "@/lib/errors";

export interface ExecuteExchangeInput {
  userId: string;
  fromCode: string;
  toCode: string;
  sourceAmount: string;
  idempotencyKey: string;
}

export interface ExchangeResult {
  transaction: {
    id: string;
    status: string;
    type: string;
    sourceAmount: string;
    fee: string;
    exchangeRate: string;
    destinationAmount: string;
    fromCode: string;
    toCode: string;
    createdAt: Date;
  };
  replayed: boolean;
  quote: ExchangeQuote;
}

/**
 * اجرای امن تبدیل ارز:
 * - اعتبارسنجی مبلغ/ارزها
 * - قفل صف Source (SELECT ... FOR UPDATE) برای جلوگیری از شرط رقابتی
 * - به‌روزرسانی اتمیک موجودی با شرط کفایت
 * - IdempotencyKey یکتا برای جلوگیری از درخواست تکراری
 */
export async function executeExchange(
  input: ExecuteExchangeInput,
): Promise<ExchangeResult> {
  const amount = new Decimal(input.sourceAmount);

  if (!amount.isPositive()) {
    throw new ExchangeError("INVALID_AMOUNT");
  }
  if (input.fromCode === input.toCode) {
    throw new ExchangeError("SAME_CURRENCY");
  }

  const idempotencyKey = input.idempotencyKey.trim();

  return prisma.$transaction(async (tx) => {
    const currencies = await tx.currency.findMany({
      where: { code: { in: [input.fromCode, input.toCode] } },
    });

    const fromCurrency = currencies.find((c) => c.code === input.fromCode);
    const toCurrency = currencies.find((c) => c.code === input.toCode);

    if (!fromCurrency || !toCurrency || !fromCurrency.isActive || !toCurrency.isActive) {
      throw new ExchangeError("INVALID_CURRENCY");
    }

    const latest = await tx.exchangeRate.findFirst({
      where: {
        baseCurrencyId: fromCurrency.id,
        quoteCurrencyId: toCurrency.id,
        validFrom: { lte: new Date() },
      },
      orderBy: { validFrom: "desc" },
    });

    if (!latest) {
      throw new ExchangeError("EXCHANGE_RATE_NOT_FOUND");
    }

    const quote = computeQuote(
      amount,
      latest.rate,
      fromCurrency.decimalPlaces,
      toCurrency.decimalPlaces,
    );

    // قفل صف کیف پول مبدأ برای جلوگیری از رقابت
    const sourceRows = await tx.$queryRaw<{ id: string; balance: string }[]>`
      SELECT id, balance
      FROM "Wallet"
      WHERE "userId" = ${input.userId} AND "currencyId" = ${fromCurrency.id}
      FOR UPDATE
    `;

    if (sourceRows.length === 0) {
      throw new ExchangeError("WALLET_NOT_FOUND");
    }

    const sourceWallet = sourceRows[0];
    const currentBalance = new Decimal(sourceWallet.balance);

    if (currentBalance.lessThan(quote.sourceAmount)) {
      throw new ExchangeError("INSUFFICIENT_BALANCE");
    }

    const destinationWallet = await tx.wallet.findUnique({
      where: {
        userId_currencyId: { userId: input.userId, currencyId: toCurrency.id },
      },
      select: { id: true },
    });

    if (!destinationWallet) {
      throw new ExchangeError("WALLET_NOT_FOUND");
    }

    // Idempotency: تلاش برای ثبت کلید یکتا
    let idempotencyRecord;
    try {
      idempotencyRecord = await tx.idempotencyKey.create({
        data: { userId: input.userId, key: idempotencyKey },
        select: { id: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const existing = await tx.idempotencyKey.findUnique({
          where: { userId_key: { userId: input.userId, key: idempotencyKey } },
          include: { transaction: true },
        });

        // اگر کلید قبلاً تراکنش موفق داشته باشد، همان نتیجه بازگردانده می‌شود
        if (existing?.transaction) {
          return {
            transaction: await mapTransaction(tx, existing.transaction.id),
            replayed: true,
            quote,
          };
        }

        // کلید یتیم از اجرای ناموفق قبلی → حذف و ادامه
        if (existing) {
          await tx.idempotencyKey.delete({ where: { id: existing.id } });
          idempotencyRecord = await tx.idempotencyKey.create({
            data: { userId: input.userId, key: idempotencyKey },
            select: { id: true },
          });
        }
      } else {
        throw error;
      }
    }

    if (!idempotencyRecord) {
      throw new ExchangeError("DUPLICATE_REQUEST");
    }

    // به‌روزرسانی اتمیک موجودی مبدأ با شرط کفایت (حفاظ دوم)
    const sourceUpdate = await tx.wallet.updateMany({
      where: {
        id: sourceWallet.id,
        balance: { gte: quote.sourceAmount },
      },
      data: { balance: { decrement: quote.sourceAmount } },
    });

    if (sourceUpdate.count === 0) {
      throw new ExchangeError("INSUFFICIENT_BALANCE");
    }

    await tx.wallet.update({
      where: { id: destinationWallet.id },
      data: { balance: { increment: quote.destinationAmount } },
    });

    const transaction = await tx.transaction.create({
      data: {
        userId: input.userId,
        type: "EXCHANGE",
        status: "COMPLETED",
        fromCurrencyId: fromCurrency.id,
        toCurrencyId: toCurrency.id,
        sourceAmount: quote.sourceAmount,
        fee: quote.fee,
        exchangeRate: quote.rate,
        destinationAmount: quote.destinationAmount,
        idempotencyKeyId: idempotencyRecord.id,
      },
      select: {
        id: true,
        status: true,
        type: true,
        sourceAmount: true,
        fee: true,
        exchangeRate: true,
        destinationAmount: true,
        createdAt: true,
      },
    });

    return {
      transaction: {
        ...transaction,
        fromCode: input.fromCode,
        toCode: input.toCode,
        sourceAmount: transaction.sourceAmount.toString(),
        fee: transaction.fee.toString(),
        exchangeRate: transaction.exchangeRate.toString(),
        destinationAmount: transaction.destinationAmount.toString(),
      },
      replayed: false,
      quote,
    };
  });
}

async function mapTransaction(
  tx: Prisma.TransactionClient,
  transactionId: string,
): Promise<ExchangeResult["transaction"]> {
  const full = await tx.transaction.findUnique({
    where: { id: transactionId },
    select: {
      id: true,
      status: true,
      type: true,
      sourceAmount: true,
      fee: true,
      exchangeRate: true,
      destinationAmount: true,
      createdAt: true,
      fromCurrency: { select: { code: true } },
      toCurrency: { select: { code: true } },
    },
  });

  return {
    id: full!.id,
    status: full!.status,
    type: full!.type,
    sourceAmount: full!.sourceAmount.toString(),
    fee: full!.fee.toString(),
    exchangeRate: full!.exchangeRate.toString(),
    destinationAmount: full!.destinationAmount.toString(),
    fromCode: full!.fromCurrency.code,
    toCode: full!.toCurrency.code,
    createdAt: full!.createdAt,
  };
}