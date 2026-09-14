export interface CurrencyDto {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isActive?: boolean;
}

export interface WalletDto {
  id: string;
  balance: string;
  currency: CurrencyDto;
}

export interface WalletsResponse {
  wallets: WalletDto[];
}

export interface CurrenciesResponse {
  currencies: CurrencyDto[];
}