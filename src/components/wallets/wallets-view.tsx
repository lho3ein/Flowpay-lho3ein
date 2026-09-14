"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeftRight, Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      toast.error(error instanceof ApiError ? error.message : "خطا در افزودن کیف پول");
    },
  });

  const wallets = walletsQuery.data?.wallets ?? [];
  const currencies = currenciesQuery.data?.currencies ?? [];

  const walletCodes = new Set(wallets.map((w) => w.currency.code));
  const availableCurrencies = currencies.filter((c) => !walletCodes.has(c.code));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">کیف پول‌ها</h1>
          <p className="text-sm text-muted-foreground">
            مدیریت ارزهای کیف پول شما
          </p>
        </div>

        {availableCurrencies.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedCode} onValueChange={setSelectedCode}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="انتخاب ارز" />
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
              onClick={() => selectedCode && addWalletMutation.mutate(selectedCode)}
            >
              <Plus className="ml-2 size-4" />
              افزودن کیف پول
            </Button>
          </div>
        )}
      </div>

      {walletsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent className="flex flex-col items-center gap-2 text-muted-foreground">
            <Wallet className="size-10 opacity-40" />
            <p>شما هنوز کیف پولی ندارید.</p>
            {availableCurrencies.length > 0 && (
              <p className="text-sm">از فرم بالا یک ارز انتخاب کنید.</p>
            )}
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
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">
          {wallet.currency.name}
          <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {wallet.currency.code}
          </span>
        </CardTitle>
        <Wallet className="size-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-2xl font-bold tabular-nums">
          {formatMoney(
            wallet.balance,
            wallet.currency.decimalPlaces,
            wallet.currency.symbol,
          )}
        </p>
        <Link
          href={`/exchange?source=${wallet.currency.code}`}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ArrowLeftRight className="size-4" />
          تبدیل ارز
        </Link>
      </CardContent>
    </Card>
  );
}