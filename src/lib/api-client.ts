import type { CurrenciesResponse, WalletDto, WalletsResponse } from "@/types/models";

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
};