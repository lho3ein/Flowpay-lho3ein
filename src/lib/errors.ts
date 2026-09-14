export const EXCHANGE_ERROR_MESSAGES: Record<string, string> = {
  INVALID_AMOUNT: "مبلغ واردشده نامعتبر است",
  SAME_CURRENCY: "ارز مبدأ و مقصد نمی‌توانند یکسان باشند",
  INVALID_CURRENCY: "ارز موردنظر یافت نشد",
  EXCHANGE_RATE_NOT_FOUND: "نرخ تبدیل موجود نیست",
  WALLET_NOT_FOUND: "کیف پول موردنظر یافت نشد",
  INSUFFICIENT_BALANCE: "موجودی کافی نیست",
  DUPLICATE_REQUEST: "درخواست تکراری است",
};

export class ExchangeError extends Error {
  code: string;

  constructor(code: string, message?: string) {
    super(message ?? EXCHANGE_ERROR_MESSAGES[code] ?? "خطای نامشخص");
    this.name = "ExchangeError";
    this.code = code;
  }
}

export function exchangeErrorStatus(code: string): number {
  switch (code) {
    case "INVALID_AMOUNT":
    case "SAME_CURRENCY":
      return 400;
    case "INVALID_CURRENCY":
    case "EXCHANGE_RATE_NOT_FOUND":
    case "WALLET_NOT_FOUND":
      return 404;
    case "INSUFFICIENT_BALANCE":
    case "DUPLICATE_REQUEST":
      return 409;
    default:
      return 500;
  }
}