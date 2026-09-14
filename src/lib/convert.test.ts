import { describe, expect, it } from "vitest";
import Decimal from "decimal.js";

import { computeTotalInUsd } from "./convert";

describe("computeTotalInUsd", () => {
  it("موجودی‌ها را با نرخ دلار جمع می‌زند", () => {
    const rates: Record<string, Decimal> = {
      EUR: new Decimal("0.8512"),
      AED: new Decimal("3.6725"),
    };
    const total = computeTotalInUsd(
      [
        { code: "USD", balance: "1000" },
        { code: "EUR", balance: "100" },
        { code: "AED", balance: "100" },
      ],
      (code) => rates[code] ?? null,
    );
    expect(total!.toFixed(4)).toBe("1452.3700");
  });

  it("وقتی هیچ نرخ دلاری در دسترس نیست null برمی‌گرداند", () => {
    const total = computeTotalInUsd(
      [{ code: "EUR", balance: "100" }],
      () => null,
    );
    expect(total).toBeNull();
  });

  it("ارز بدون نرخ را نادیده می‌گیرد", () => {
    const total = computeTotalInUsd(
      [
        { code: "USD", balance: "500" },
        { code: "XXX", balance: "999" },
      ],
      () => null,
    );
    expect(total!.toFixed(2)).toBe("500.00");
  });
});