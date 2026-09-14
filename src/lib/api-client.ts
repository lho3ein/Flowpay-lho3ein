import type {
  CurrenciesResponse,
  ExchangeQuoteResponse,
  ExchangeResponse,
  TransactionDetailResponse,
  TransactionFilters,
  TransactionsResponse,
  WalletDto,
  WalletsResponse,
} from "@/types/models";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? "درخواست ناموفق بود", body.error);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getCurrencies: () => fetch("/api/currencies").then((r) => handle<CurrenciesResponse>(r)),
  getWallets: () => fetch("/api/wallets").then((r) => handle<WalletsResponse>(r)),
  addWallet: (currencyCode: string) =>
    fetch("/api/wallets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currencyCode }),
    }).then((r) => handle<{ wallet: WalletDto }>(r)),
  getExchangeQuote: (from: string, to: string, amount: string) =>
    fetch(
      `/api/exchange/quote?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}`,
    ).then((r) => handle<ExchangeQuoteResponse>(r)),
  executeExchange: (payload: {
    fromCode: string;
    toCode: string;
    sourceAmount: string;
    idempotencyKey: string;
  }) =>
    fetch("/api/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<ExchangeResponse>(r)),
  getTransactions: (filters: TransactionFilters) => {
    const params = new URLSearchParams();
    if (filters.page !== undefined) params.set("page", String(filters.page));
    if (filters.limit !== undefined) params.set("limit", String(filters.limit));
    if (filters.status) params.set("status", filters.status);
    if (filters.type) params.set("type", filters.type);
    if (filters.fromCode) params.set("fromCode", filters.fromCode);
    if (filters.toCode) params.set("toCode", filters.toCode);
    if (filters.fromDate) params.set("fromDate", filters.fromDate);
    if (filters.toDate) params.set("toDate", filters.toDate);
    const qs = params.toString();
    return fetch(`/api/transactions${qs ? `?${qs}` : ""}`).then((r) =>
      handle<TransactionsResponse>(r),
    );
  },
  getTransaction: (id: string) =>
    fetch(`/api/transactions/${id}`).then((r) =>
      handle<TransactionDetailResponse>(r),
    ),
};