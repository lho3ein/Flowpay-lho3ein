import { expect, test } from "vitest";

import { cn } from "@/lib/utils";

test("merges conflicting tailwind classes", () => {
  expect(cn("px-2 p-4")).toBe("p-4");
});

test("joins className inputs", () => {
  expect(cn("a", "b", undefined, "c")).toBe("a b c");
});