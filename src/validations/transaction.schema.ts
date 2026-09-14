import { z } from "zod";

const codeFilter = z
  .string()
  .trim()
  .toUpperCase()
  .min(3, "کد ارز نامعتبر است")
  .max(5, "کد ارز نامعتبر است")
  .optional();

const dateFilter = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ باید با فرمت YYYY-MM-DD باشد")
  .optional();

export const transactionListQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "شماره صفحه نامعتبر است")
    .optional()
    .default("1"),
  limit: z
    .string()
    .regex(/^\d+$/, "تعداد در صفحه نامعتبر است")
    .optional()
    .default("20"),
  status: z
    .enum(["PENDING", "COMPLETED", "FAILED"], {
      error: "وضعیت نامعتبر است",
    })
    .optional(),
  type: z
    .enum(["EXCHANGE"], { error: "نوع نامعتبر است" })
    .optional(),
  fromCode: codeFilter,
  toCode: codeFilter,
  fromDate: dateFilter,
  toDate: dateFilter,
});

export type TransactionListQuery = z.infer<typeof transactionListQuerySchema>;