import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";

import {
  computeDestinationAmount,
  computeFee,
  computeQuote,
  FEE_RATE,
} from "./exchange";

describe("FEE_RATE", () => {
  it("نرخ کارمزد ۰٫۷۵٪ است", () => {
    expect(FEE_RATE.toFixed(4)).toBe("0.0075");
  });
});

describe("computeFee", () => {
  it("کارمزد ۱۰۰۰ دلار برابر ۷٫۵ است", () => {
    expect(computeFee("1000", 2).toString()).toBe("7.5");
  });

  it("با ROUND_HALF_UP گرد می‌شود", () => {
    // ۱۰ دلار → ۰٫۰۷۵ → با HALF-UP برابر ۰٫۰۸
    expect(computeFee("10", 2).toString()).toBe("0.08");
    // ۷۰ دلار → ۰٫۵۲۵ → ۰٫۵۳
    expect(computeFee("70", 2).toString()).toBe("0.53");
    // ۰٫۵ دلار → ۰٫۰۰۳۷۵ → ۰.۰۰
    expect(computeFee("0.5", 2).toString()).toBe("0");
  });
});

describe("computeDestinationAmount", () => {
  it("حاصل ضرب مبدأ در نرخ است", () => {
    expect(
      computeDestinationAmount("1000", "0.8512", 2).toString(),
    ).toBe("851.2");
  });

  it("با ROUND_DOWN اعشار اضافه را حذف می‌کند", () => {
    expect(
      computeDestinationAmount("100", "0.85129", 2).toString(),
    ).toBe("85.12");
  });

  it("حتی در آستانه ۰٫۰۰۵ هم رو به پایین گرد می‌کند", () => {
    // ۱۰۰۰ × ۱٫۰۰۰۰۰۵ = ۱۰۰۰٫۰۰۵ → ROUND_DOWN → ۱۰۰۰.۰۰
    expect(
      computeDestinationAmount("1000", "1.000005", 2).toString(),
    ).toBe("1000");
  });
});

describe("computeQuote", () => {
  it("نمونه مستندات: ۱۰۰۰ دلار → یورو با نرخ ۰٫۸۵۱۲", () => {
    const quote = computeQuote("1000", "0.8512", 2, 2);
    expect(quote.sourceAmount.toString()).toBe("1000");
    expect(quote.fee.toString()).toBe("7.5");
    expect(quote.destinationAmount.toString()).toBe("851.2");
    expect(quote.rate.toFixed(4)).toBe("0.8512");
  });

  it("اعشارهای مختلف ارز را به‌درستی اعمال می‌کند", () => {
    // ارز مبدأ با ۲ رقم اعشار و ارز مقصد با ۴ رقم اعشار
    const quote = computeQuote("100", "3.6725", 2, 4);
    expect(quote.fee.toString()).toBe("0.75"); // ۱۰۰ × ۰٫۷۵٪
    expect(quote.destinationAmount.toString()).toBe("367.25"); // ۱۰۰ × ۳٫۶۷۲۵
  });
});