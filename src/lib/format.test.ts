import { describe, expect, it } from "vitest";

import { formatMoney, formatNumber } from "./format";

describe("formatMoney", () => {
  it("مبلغ را با اعداد فارسی و دو رقم اعشار قالب‌بندی می‌کند", () => {
    expect(formatMoney("10000", 2, "$")).toBe("۱۰٬۰۰۰٫۰۰ $");
  });

  it("اعشار را به تعداد درخواستی نگه می‌دارد", () => {
    expect(formatMoney("1234.5", 3, "€")).toBe("۱٬۲۳۴٫۵۰۰ €");
  });

  it("عدد اعشاری Decimal را می‌پذیرد", () => {
    expect(formatMoney("99999999.99", 2)).toBe("۹۹٬۹۹۹٬۹۹۹٫۹۹");
  });

  it("عدد صفر را به‌درستی نمایش می‌دهد", () => {
    expect(formatMoney("0", 2, "AED")).toBe("۰٫۰۰ AED");
  });
});

describe("formatNumber", () => {
  it("عدد را بدون سمبل قالب‌بندی می‌کند", () => {
    expect(formatNumber("0.8512", 4)).toBe("۰٫۸۵۱۲");
  });

  it("کسری‌های اضافی را گرد می‌کند", () => {
    expect(formatNumber("3.6725123", 4)).toBe("۳٫۶۷۲۵");
  });
});