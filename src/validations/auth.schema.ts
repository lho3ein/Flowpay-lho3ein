import { z } from "zod";

export const loginSchema = z.object({
  email: z.string({ error: "ایمیل الزامی است" }).email("ایمیل نامعتبر است"),
  password: z
    .string({ error: "رمز عبور الزامی است" })
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(50, "نام نباید بیشتر از ۵۰ کاراکتر باشد")
    .optional(),
  email: z.string({ error: "ایمیل الزامی است" }).email("ایمیل نامعتبر است"),
  password: z
    .string({ error: "رمز عبور الزامی است" })
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
    .max(72, "رمز عبور نباید بیشتر از ۷۲ کاراکتر باشد"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;