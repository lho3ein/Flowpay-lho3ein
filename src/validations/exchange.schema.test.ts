import { describe, expect, it } from "vitest";

import {
  amountStringSchema,
  currencyCodeSchema,
  exchangeSchema,
  quoteQuerySchema,
} from "./exchange.schema";

describe("currencyCodeSchema", () => {
  it("accepts 3-letter codes and normalizes to uppercase", () => {
    expect(currencyCodeSchema.parse("usd")).toBe("USD");
    expect(currencyCodeSchema.parse(" USD ")).toBe("USD");
  });

  it("rejects invalid codes", () => {
    for (const bad of ["", "US", "USDMORE", 123 as never]) {
      expect(currencyCodeSchema.safeParse(bad).success).toBe(false);
    }
  });
});

describe("amountStringSchema", () => {
  it("accepts up to 8 decimal places", () => {
    for (const v of ["1", "0.5", "12345678901234.12345678", "0.00000001"]) {
      expect(amountStringSchema.safeParse(v).success).toBe(true);
    }
  });

  it("rejects zero, negatives, more than 8 decimals, too-large integer", () => {
    for (const bad of [
      "0",
      "0.0",
      "0.00000000",
      "-5",
      "1.123456789",
      "123456789012345",
      "1e5",
    ]) {
      expect(amountStringSchema.safeParse(bad).success).toBe(false);
    }
  });
});

describe("quoteQuerySchema", () => {
  it("parses valid quote query", () => {
    const result = quoteQuerySchema.parse({ from: "usd", to: "EUR", amount: "100" });
    expect(result).toEqual({ from: "USD", to: "EUR", amount: "100" });
  });
});

describe("exchangeSchema", () => {
  const valid = {
    fromCode: "USD",
    toCode: "EUR",
    sourceAmount: "100.5",
    idempotencyKey: "req-000-001",
  };

  it("accepts a valid exchange payload", () => {
    expect(exchangeSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects same source and target currency", () => {
    const result = exchangeSchema.safeParse({ ...valid, toCode: "USD" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "ارز مبدأ و مقصد نمی‌توانند یکسان باشند",
      );
    }
  });

  it("rejects missing or short idempotency key", () => {
    expect(
      exchangeSchema.safeParse({ ...valid, idempotencyKey: undefined }).success,
    ).toBe(false);
    expect(
      exchangeSchema.safeParse({ ...valid, idempotencyKey: "short" }).success,
    ).toBe(false);
    expect(
      exchangeSchema.safeParse({ ...valid, idempotencyKey: "x".repeat(65) }).success,
    ).toBe(false);
  });

  it("rejects invalid source amount", () => {
    expect(
      exchangeSchema.safeParse({ ...valid, sourceAmount: "0" }).success,
    ).toBe(false);
  });
});