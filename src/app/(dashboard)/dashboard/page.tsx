import Decimal from "decimal.js";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { auth } from "@/lib/auth";
import { computeTotalInUsd } from "@/lib/convert";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "داشبورد",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [wallets, usdCurrency, recentTransactions] = await Promise.all([
    prisma.wallet.findMany({
      where: { userId },
      include: { currency: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.currency.findUnique({ where: { code: "USD" } }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        fromCurrency: true,
        toCurrency: true,
      },
    }),
  ]);

  // آخرین نرخ‌های دلار → هر ارز
  let usdRateMap: Map<string, { rate: Decimal; validFrom: Date }> | null = null;
  if (usdCurrency) {
    const now = new Date();
    const rates = await prisma.exchangeRate.findMany({
      where: {
        baseCurrencyId: usdCurrency.id,
        validFrom: { lte: now },
      },
      include: { quoteCurrency: true },
    });

    usdRateMap = new Map();
    for (const r of rates) {
      const current = usdRateMap.get(r.quoteCurrency.code);
      if (!current || r.validFrom > current.validFrom) {
        usdRateMap.set(r.quoteCurrency.code, {
          rate: r.rate,
          validFrom: r.validFrom,
        });
      }
    }
  }

  const totalUsd = computeTotalInUsd(
    wallets.map((w) => ({ code: w.currency.code, balance: w.balance })),
    (code) =>
      code === "USD" ? new Decimal(1) : (usdRateMap?.get(code)?.rate ?? null),
  );

  return (
    <DashboardOverview
      userName={session!.user.name ?? undefined}
      wallets={wallets.map((w) => ({
        code: w.currency.code,
        name: w.currency.name,
        symbol: w.currency.symbol,
        decimalPlaces: w.currency.decimalPlaces,
        balance: w.balance.toString(),
      }))}
      totalUsd={totalUsd}
      recentTransactions={recentTransactions.map((t) => ({
        id: t.id,
        type: t.type,
        status: t.status,
        sourceAmount: t.sourceAmount.toString(),
        destinationAmount: t.destinationAmount.toString(),
        fromCurrency: t.fromCurrency && {
          code: t.fromCurrency.code,
          symbol: t.fromCurrency.symbol,
          decimalPlaces: t.fromCurrency.decimalPlaces,
        },
        toCurrency: t.toCurrency && {
          code: t.toCurrency.code,
          symbol: t.toCurrency.symbol,
          decimalPlaces: t.toCurrency.decimalPlaces,
        },
        createdAt: t.createdAt,
      }))}
    />
  );
}
