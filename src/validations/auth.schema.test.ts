import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./auth.schema";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "12345678" }).success,
    ).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "12345678" }).success).toBe(false);
  });

  it("rejects short password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "1234567" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = { name: "کاربر", email: "a@b.com", password: "12345678" };

  it("accepts a valid registration", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("name is optional but trimmed and length-checked", () => {
    expect(registerSchema.safeParse({ ...valid, name: undefined }).success).toBe(true);
    expect(registerSchema.safeParse({ ...valid, name: "a" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, name: "  " }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, name: "  کاربر  " }).data?.name).toBe("کاربر");
  });

  it("rejects password outside 8..72 range", () => {
    expect(registerSchema.safeParse({ ...valid, password: "1234567" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, password: "x".repeat(73) }).success).toBe(false);
  });
});