import { z } from "zod";

export const currencyCodeSchema = z
  .string({ error: "کد ارز الزامی است" })
  .trim()
  .toUpperCase()
  .min(3, "کد ارز نامعتبر است")
  .max(5, "کد ارز نامعتبر است");

/** مبلغ ورودی به‌صورت رشته، حداکثر ۸ رقم اعشار (هم‌خانواده با Decimal(20,8)) */
export const amountStringSchema = z
  .string({ error: "مبلغ الزامی است" })
  .regex(/^\d{1,14}(\.\d{1,8})?$/, "مبلغ واردشده نامعتبر است")
  .refine((v) => !/^0+(\.0+)?$/.test(v), { message: "مبلغ باید بزرگ‌تر از صفر باشد" });

export const quoteQuerySchema = z.object({
  from: currencyCodeSchema,
  to: currencyCodeSchema,
  amount: amountStringSchema,
});

export const exchangeSchema = z
  .object({
    fromCode: currencyCodeSchema,
    toCode: currencyCodeSchema,
    sourceAmount: amountStringSchema,
    idempotencyKey: z
      .string({ error: "کلید یکتای درخواست الزامی است" })
      .trim()
      .min(8, "کلید یکتای درخواست نامعتبر است")
      .max(64, "کلید یکتای درخواست بیش از حد مجاز است"),
  })
  .refine((v) => v.fromCode !== v.toCode, {
    message: "ارز مبدأ و مقصد نمی‌توانند یکسان باشند",
    path: ["toCode"],
  });

export type QuoteQuery = z.infer<typeof quoteQuerySchema>;
export type ExchangeInput = z.infer<typeof exchangeSchema>;