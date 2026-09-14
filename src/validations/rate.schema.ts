import { z } from "zod";

export const rateQuerySchema = z
  .object({
    base: z
      .string({ error: "ارز مبدأ الزامی است" })
      .trim()
      .toUpperCase()
      .min(3, "کد ارز مبدأ نامعتبر است")
      .max(5, "کد ارز مبدأ نامعتبر است"),
    quote: z
      .string({ error: "ارز مقصد الزامی است" })
      .trim()
      .toUpperCase()
      .min(3, "کد ارز مقصد نامعتبر است")
      .max(5, "کد ارز مقصد نامعتبر است"),
  })
  .refine((v) => v.base !== v.quote, {
    message: "ارز مبدأ و مقصد نمی‌توانند یکسان باشند",
    path: ["quote"],
  });

export type RateQuery = z.infer<typeof rateQuerySchema>;