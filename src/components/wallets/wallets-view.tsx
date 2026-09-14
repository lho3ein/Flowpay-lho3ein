"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, Loader2, Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import type { WalletDto } from "@/types/models";

const CURRENCY_TONE: Record<string, string> = {
  USD: "bg-currency-usd/12 text-currency-usd ring-currency-usd/30",
  EUR: "bg-currency-eur/12 text-currency-eur ring-currency-eur/30",
  GBP: "bg-currency-gbp/12 text-currency-gbp ring-currency-gbp/30",
  AED: "bg-currency-aed/12 text-currency-aed ring-currency-aed/30",
};

const CURRENCY_STRIP: Record<string, string> = {
  USD: "from-currency-usd/25 to-transparent",
  EUR: "from-currency-eur/25 to-transparent",
  GBP: "from-currency-gbp/25 to-transparent",
  AED: "from-currency-aed/25 to-transparent",
};

function currencyTone(code: string) {
  return CURRENCY_TONE[code] ?? "bg-primary/10 text-primary ring-primary/30";
}

function currencyStrip(code: string) {
  return CURRENCY_STRIP[code] ?? "from-primary/20 to-transparent";
}

export function WalletsView() {
  const queryClient = useQueryClient();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const walletsQuery = useQuery({
    queryKey: ["wallets"],
    queryFn: api.getWallets,
  });

  const currenciesQuery = useQuery({
    queryKey: ["currencies"],
    queryFn: api.getCurrencies,
  });

  const addWalletMutation = useMutation({
    mutationFn: api.addWallet,
    onSuccess: () => {
      toast.success("کیف پول جدید اضافه شد");
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      setSelectedCode(null);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "خطا در افزودن کیف پول",
      );
    },
  });

  const wallets = walletsQuery.data?.wallets ?? [];
  const currencies = currenciesQuery.data?.currencies ?? [];

  const walletCodes = new Set(wallets.map((w) => w.currency.code));
  const availableCurrencies = currencies.filter(
    (c) => !walletCodes.has(c.code),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black sm:text-3xl">کیف پول‌ها</h1>
          <p className="text-sm text-muted-foreground">
            موجودی ارزهای شما و دسترسی سریع به تبدیل
          </p>
        </div>

        {availableCurrencies.length > 0 && (
          <Card className="w-full sm:max-w-md">
            <CardContent className="flex items-center gap-2 p-3">
              <Select value={selectedCode} onValueChange={setSelectedCode}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="ارز جدید را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies.map((c) => (
                    <SelectItem key={c.id} value={c.code}>
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                disabled={!selectedCode || addWalletMutation.isPending}
                onClick={() =>
                  selectedCode && addWalletMutation.mutate(selectedCode)
                }
              >
                {addWalletMutation.isPending ? (
                  <Loader2 className="ml-2 size-4 animate-spin" />
                ) : (
                  <Plus className="ml-2 size-4" />
                )}
                افزودن
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {walletsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent className="flex flex-col items-center gap-3 text-muted-foreground">
            <span className="grid size-12 place-items-center rounded-2xl bg-muted">
              <Wallet className="size-6" />
            </span>
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                شما هنوز کیف پولی ندارید.
              </p>
              {availableCurrencies.length > 0 && (
                <p className="text-sm">از فرم بالا یک ارز انتخاب کنید.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <WalletCard key={wallet.id} wallet={wallet} />
          ))}
        </div>
      )}
    </div>
  );
}

function WalletCard({ wallet }: { wallet: WalletDto }) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b ${currencyStrip(wallet.currency.code)}`}
      />
      <CardContent className="relative space-y-5 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`grid size-11 place-items-center rounded-2xl ring-1 ${currencyTone(wallet.currency.code)}`}
            >
              <Wallet className="size-5" />
            </span>
            <div>
              <p className="font-bold">{wallet.currency.name}</p>
              <p className="text-xs text-muted-foreground">
                {wallet.currency.symbol} · {wallet.currency.code}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="tabular-nums">
            {wallet.currency.code}
          </Badge>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">موجودی</p>
          <p
            className="text-3xl font-black tabular-nums"
            dir="ltr"
            style={{ textAlign: "right" }}
          >
            {formatMoney(
              wallet.balance,
              wallet.currency.decimalPlaces,
              wallet.currency.symbol,
            )}
          </p>
        </div>

        <Link
          href={`/exchange?source=${wallet.currency.code}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <ArrowLeftRight className="size-4" />
          تبدیل ارز
        </Link>
      </CardContent>
    </Card>
  );
}
