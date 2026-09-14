import Decimal from "decimal.js";

/** نرخ کارمزد: ۰٫۷۵٪ */
export const FEE_RATE = new Decimal("0.0075");

/**
 * بررسی می‌کند که مبلغِ رشته‌ای بیش از اعشار مجاز نداشته باشد.
 */
export function hasExcessFractionDigits(amount: string, decimalPlaces: number): boolean {
  const parts = amount.split(".");
  if (parts.length < 2) return false;
  return parts[1].length > decimalPlaces;
}

export interface ExchangeQuote {
  sourceAmount: Decimal;
  fee: Decimal;
  destinationAmount: Decimal;
  rate: Decimal;
}

/**
 * کارمزد تبدیل = مبلغ × نرخ کارمزد، گرد شده با ROUND_HALF_UP به اعشار ارز مبدأ.
 */
export function computeFee(
  sourceAmount: Decimal.Value,
  decimalPlaces: number,
): Decimal {
  return new Decimal(sourceAmount)
    .times(FEE_RATE)
    .toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP);
}

/**
 * مبلغ دریافتی = مبلغ × نرخ، گرد شده با ROUND_DOWN به اعشار ارز مقصد
 * (هرگز به ضرر کاربر اضافه نمی‌شود).
 */
export function computeDestinationAmount(
  sourceAmount: Decimal.Value,
  rate: Decimal.Value,
  decimalPlaces: number,
): Decimal {
  return new Decimal(sourceAmount)
    .times(rate)
    .toDecimalPlaces(decimalPlaces, Decimal.ROUND_DOWN);
}

/**
 * محاسبه کامل یک تبدیل با توجه به نرخ و اعشار هر دو ارز.
 */
export function computeQuote(
  sourceAmount: Decimal.Value,
  rate: Decimal.Value,
  sourceDecimalPlaces: number,
  destinationDecimalPlaces: number,
): ExchangeQuote {
  const parsed = new Decimal(sourceAmount);
  const fee = computeFee(parsed, sourceDecimalPlaces);
  const destinationAmount = computeDestinationAmount(
    parsed,
    rate,
    destinationDecimalPlaces,
  );

  return {
    sourceAmount: parsed,
    fee,
    destinationAmount,
    rate: new Decimal(rate),
  };
}