import Decimal from "decimal.js";

import { prisma } from "@/lib/prisma";

export interface LatestRateValue {
  rate: Decimal;
  validFrom: Date;
}

/**
 * جدیدترین نرخ را از بین چند نرخ انتخاب می‌کند (بر اساس فیلد validFrom).
 * Pure - قابل تست بدون دیتابیس.
 */
export function pickLatestRate<R extends LatestRateValue>(rates: R[]): R | null {
  if (rates.length === 0) return null;
  return rates.reduce((best, current) =>
    current.validFrom > best.validFrom ? current : best,
  );
}

/**
 * جدیدترین نرخ معتبر بین دو ارز را برمی‌گرداند.
 * نرخ بین ارز یکسان همیشه ۱ است.
 */
export async function getLatestRate(
  baseCode: string,
  quoteCode: string,
): Promise<LatestRateValue | null> {
  if (baseCode === quoteCode) {
    return { rate: new Decimal(1), validFrom: new Date(0) };
  }

  const currencies = await prisma.currency.findMany({
    where: { code: { in: [baseCode, quoteCode] } },
  });

  const base = currencies.find((c) => c.code === baseCode);
  const quote = currencies.find((c) => c.code === quoteCode);
  if (!base || !quote) return null;

  const rates = await prisma.exchangeRate.findMany({
    where: {
      baseCurrencyId: base.id,
      quoteCurrencyId: quote.id,
      validFrom: { lte: new Date() },
    },
    select: { rate: true, validFrom: true },
    orderBy: { validFrom: "desc" },
    take: 1,
  });

  const latest = rates[0];
  return latest ? { rate: latest.rate, validFrom: latest.validFrom } : null;
}