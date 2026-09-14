import Decimal from "decimal.js";
import { ArrowDownUp, Wallet } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

type WalletItem = {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  balance: string;
};

type RecentTx = {
  id: string;
  type: string;
  status: string;
  sourceAmount: string;
  destinationAmount: string;
  fromCurrency: { code: string; symbol: string; decimalPlaces: number } | null;
  toCurrency: { code: string; symbol: string; decimalPlaces: number } | null;
  createdAt: Date;
};

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: "موفق",
  PENDING: "در انتظار",
  FAILED: "ناموفق",
};

const TYPE_LABEL: Record<string, string> = {
  EXCHANGE: "تبدیل",
  FEE: "کارمزد",
  DEPOSIT: "واریز",
  WITHDRAWAL: "برداشت",
};

export function DashboardOverview({
  userName,
  wallets,
  totalUsd,
  recentTransactions,
}: {
  userName: string | undefined;
  wallets: WalletItem[];
  totalUsd: Decimal | null;
  recentTransactions: RecentTx[];
}) {
  const firstName = userName?.trim().split(/\s+/)[0] || "کاربر";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">سلام {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground">
          نمای کلی دارایی‌های شما در فلوپی
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>مجموع دارایی (تخمینی)</CardDescription>
          <CardTitle className="text-3xl tabular-nums">
            {totalUsd
              ? formatMoney(totalUsd, 2, "$")
              : "— (نرخ ارز در دسترس نیست)"}
          </CardTitle>
        </CardHeader>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">کیف پول‌ها</h2>
          <Link
            href="/wallets"
            className="text-sm text-primary hover:underline"
          >
            مشاهده همه
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {wallets.map((wallet) => (
            <Card key={wallet.code}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Wallet className="size-4" />
                    {wallet.name}
                  </div>
                  <p className="text-lg font-bold tabular-nums">
                    {formatMoney(
                      wallet.balance,
                      wallet.decimalPlaces,
                      wallet.symbol,
                    )}
                  </p>
                </div>
                <Badge variant="secondary">{wallet.code}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">تراکنش‌های اخیر</h2>
          <Link
            href="/transactions"
            className="text-sm text-primary hover:underline"
          >
            مشاهده همه
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                <ArrowDownUp className="size-8 opacity-40" />
                <p>تراکنشی ثبت نشده است.</p>
              </div>
            ) : (
              <ul className="divide-y">
                {recentTransactions.map((tx) => {
                  const source = tx.fromCurrency;
                  const quote = tx.toCurrency;
                  return (
                    <li
                      key={tx.id}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-full bg-muted">
                          <ArrowDownUp className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {TYPE_LABEL[tx.type] ?? tx.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString("fa-IR")}
                          </p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="font-semibold tabular-nums">
                          {source
                            ? `${formatMoney(tx.sourceAmount, source.decimalPlaces, source.symbol)}`
                            : formatMoney(tx.sourceAmount)}
                          {quote &&
                            quote.code !== source?.code &&
                            ` → ${formatMoney(tx.destinationAmount, quote.decimalPlaces, quote.symbol)}`}
                        </p>
                        <Badge
                          variant={
                            tx.status === "COMPLETED"
                              ? "default"
                              : tx.status === "FAILED"
                                ? "destructive"
                                : "secondary"
                          }
                          className="mt-0.5"
                        >
                          {STATUS_LABEL[tx.status] ?? tx.status}
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}