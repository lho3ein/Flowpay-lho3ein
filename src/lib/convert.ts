import Decimal from "decimal.js";

/**
 * محاسبه مجموع دارایی کاربر به دلار با آخرین نرخ‌های موجود.
 * خروجی: مجموع یا null (در صورت نبودن نرخ لازم).
 */
export function computeTotalInUsd(
  balances: { code: string; balance: Decimal.Value }[],
  usdRate: (currencyCode: string) => Decimal | null,
): Decimal | null {
  let total = new Decimal(0);
  let hasUsdRate = false;

  for (const { code, balance } of balances) {
    if (code === "USD") {
      total = total.plus(balance);
      hasUsdRate = true;
      continue;
    }

    const rate = usdRate(code);
    if (rate === null) continue;

    total = total.plus(new Decimal(balance).times(rate));
    hasUsdRate = true;
  }

  return hasUsdRate ? total : null;
}