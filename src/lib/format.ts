import Decimal from "decimal.js";

/**
 * قالب‌بندی مبلغ با اعداد فارسی و جداکننده‌های هزارگان.
 * مقدار ورودی یک Decimal خام (اعشاری ایمن توسط Decimal.js) است.
 */
export function formatMoney(
  value: Decimal.Value,
  decimalPlaces = 2,
  symbol?: string,
): string {
  const decimal = new Decimal(value).toDecimalPlaces(decimalPlaces);

  const formatted = new Intl.NumberFormat("fa-IR", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(decimal.toNumber());

  return symbol ? `${formatted} ${symbol}` : formatted;
}

export function formatNumber(
  value: Decimal.Value,
  maxFractionDigits = 2,
): string {
  const decimal = new Decimal(value);
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: maxFractionDigits,
  }).format(decimal.toNumber());
}