import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";

import { pickLatestRate } from "./exchange-rate.service";

describe("pickLatestRate", () => {
  it("جدیدترین نرخ را براساس validFrom برمی‌گرداند", () => {
    const base = new Date("2026-01-01");
    const latest = new Date("2026-03-15");
    const result = pickLatestRate([
      { rate: new Decimal("0.8000"), validFrom: base },
      { rate: new Decimal("0.8512"), validFrom: latest },
      { rate: new Decimal("0.8200"), validFrom: new Date("2026-02-01") },
    ]);

    expect(result?.validFrom).toBe(latest);
    expect(result?.rate.toFixed(4)).toBe("0.8512");
  });

  it("برای آرایه خالی null برمی‌گرداند", () => {
    expect(pickLatestRate([])).toBeNull();
  });

  it("نرخ تکی را همان برمی‌گرداند", () => {
    const date = new Date("2026-01-01");
    const result = pickLatestRate([{ rate: new Decimal("3.6725"), validFrom: date }]);
    expect(result?.rate.toFixed(4)).toBe("3.6725");
  });
});