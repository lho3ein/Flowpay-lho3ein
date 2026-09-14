import { describe, expect, it } from "vitest";

import { exchangeErrorStatus, ExchangeError } from "./errors";

describe("ExchangeError", () => {
  it("uses the Persian message for known codes", () => {
    expect(new ExchangeError("INSUFFICIENT_BALANCE").message).toBe("موجودی کافی نیست");
  });

  it("falls back to a generic message for unknown codes", () => {
    expect(new ExchangeError("UNKNOWN").message).toBe("خطای نامشخص");
  });
});

describe("exchangeErrorStatus", () => {
  it("maps INVALID_AMOUNT and SAME_CURRENCY to 400", () => {
    expect(exchangeErrorStatus("INVALID_AMOUNT")).toBe(400);
    expect(exchangeErrorStatus("SAME_CURRENCY")).toBe(400);
  });

  it("maps currency/rate/wallet not found to 404", () => {
    expect(exchangeErrorStatus("INVALID_CURRENCY")).toBe(404);
    expect(exchangeErrorStatus("EXCHANGE_RATE_NOT_FOUND")).toBe(404);
    expect(exchangeErrorStatus("WALLET_NOT_FOUND")).toBe(404);
  });

  it("maps conflicts to 409", () => {
    expect(exchangeErrorStatus("INSUFFICIENT_BALANCE")).toBe(409);
    expect(exchangeErrorStatus("DUPLICATE_REQUEST")).toBe(409);
  });

  it("defaults to 500", () => {
    expect(exchangeErrorStatus("UNKNOWN")).toBe(500);
  });
});