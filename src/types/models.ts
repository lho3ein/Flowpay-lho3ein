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

export interface ExchangeQuoteResponse {
  quote: {
    sourceAmount: string;
    fee: string;
    destinationAmount: string;
    rate: string;
    validFrom: string;
  };
  source: CurrencyDto;
  target: CurrencyDto;
}

export interface ExchangeTransactionDto {
  id: string;
  status: string;
  type: string;
  sourceAmount: string;
  fee: string;
  exchangeRate: string;
  destinationAmount: string;
  fromCode: string;
  toCode: string;
  createdAt: string;
}

export interface ExchangeResponse {
  transaction: ExchangeTransactionDto;
  replayed: boolean;
}