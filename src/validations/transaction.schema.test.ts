import { describe, expect, it } from "vitest";

import { transactionListQuerySchema } from "./transaction.schema";

describe("transactionListQuerySchema", () => {
  it("applies defaults for page and limit", () => {
    const result = transactionListQuerySchema.parse({});
    expect(result.page).toBe("1");
    expect(result.limit).toBe("20");
  });

  it("accepts all filters", () => {
    const result = transactionListQuerySchema.parse({
      page: "2",
      limit: "10",
      status: "COMPLETED",
      type: "EXCHANGE",
      fromCode: " usd ",
      toCode: "eur",
      fromDate: "2026-09-01",
      toDate: "2026-09-14",
    });
    expect(result.status).toBe("COMPLETED");
    expect(result.fromCode).toBe("USD");
    expect(result.toCode).toBe("EUR");
  });

  it("rejects invalid filter values", () => {
    expect(transactionListQuerySchema.safeParse({ status: "MADE_UP" }).success).toBe(false);
    expect(transactionListQuerySchema.safeParse({ type: "DEPOSIT" }).success).toBe(false);
    expect(transactionListQuerySchema.safeParse({ page: "abc" }).success).toBe(false);
    expect(transactionListQuerySchema.safeParse({ fromDate: "14/09/2026" }).success).toBe(false);
    expect(transactionListQuerySchema.safeParse({ fromCode: "US" }).success).toBe(false);
  });
});