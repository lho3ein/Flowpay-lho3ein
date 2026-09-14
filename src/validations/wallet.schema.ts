import { z } from "zod";

export const addWalletSchema = z.object({
  currencyCode: z
    .string({ error: "کد ارز الزامی است" })
    .trim()
    .toUpperCase()
    .min(3, "کد ارز نامعتبر است")
    .max(5, "کد ارز نامعتبر است"),
});

export type AddWalletInput = z.infer<typeof addWalletSchema>;