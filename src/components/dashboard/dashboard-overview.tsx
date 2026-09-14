import Decimal from "decimal.js";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowUpRight,
  Coins,
  Landmark,
  ReceiptText,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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

const STATUS_TONE: Record<string, "success" | "warning" | "destructive"> = {
  COMPLETED: "success",
  PENDING: "warning",
  FAILED: "destructive",
};

const TYPE_LABEL: Record<string, string> = {
  EXCHANGE: "تبدیل",
  FEE: "کارمزد",
  DEPOSIT: "واریز",
  WITHDRAWAL: "برداشت",
};

const CURRENCY_TONE: Record<string, string> = {
  USD: "bg-currency-usd/12 text-currency-usd ring-currency-usd/30",
  EUR: "bg-currency-eur/12 text-currency-eur ring-currency-eur/30",
  GBP: "bg-currency-gbp/12 text-currency-gbp ring-currency-gbp/30",
  AED: "bg-currency-aed/12 text-currency-aed ring-currency-aed/30",
};

function currencyTone(code: string) {
  return CURRENCY_TONE[code] ?? "bg-primary/10 text-primary ring-primary/30";
}

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
      {/* سربرگ */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black sm:text-3xl">سلام {firstName} 👋</h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Coins className="size-4" />
            نمای کلی دارایی‌های شما
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href="/transactions" />}>
            <ReceiptText className="size-4" />
            تراکنش‌ها
          </Button>
          <Button render={<Link href="/exchange" />}>
            <ArrowDownUp className="size-4" />
            تبدیل ارز
          </Button>
        </div>
      </div>

      {/* مجموع دارایی */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 p-6 text-primary-foreground shadow-xl shadow-primary/25 sm:p-8">
        <div className="pointer-events-none absolute -left-16 -top-20 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 size-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-white/15">
                <Wallet className="size-5" />
              </span>
              <span className="text-sm text-primary-foreground/85">
                مجموع دارایی (تخمینی به دلار)
              </span>
            </div>
            <Badge className="border-white/25 bg-white/15 text-primary-foreground">
              برآورد لحظه‌ای
            </Badge>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="text-4xl font-black tabular-nums sm:text-5xl">
              {totalUsd
                ? formatMoney(totalUsd, 2, "$")
                : "—"}
            </p>
            <p className="max-w-xs text-xs text-primary-foreground/70">
              {totalUsd === null
                ? "نرخ تبدیل برخی ارزها در دسترس نیست؛ مجموع کامل نمایش داده نمی‌شود."
                : "بر اساس نرخ‌های لحظه‌ای ارز و مجموع موجودی همه‌ی کیف پول‌های شما محاسبه شده است."}
            </p>
          </div>
        </div>
      </section>

      {/* کیف پول‌ها */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="size-5 text-primary" />
            <h2 className="text-lg font-bold">کیف پول‌ها</h2>
          </div>
          <Link
            href="/wallets"
            className="group flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            مشاهده همه
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {wallets.map((wallet) => (
            <Link
              key={wallet.code}
              href={`/exchange?source=${wallet.code}`}
              className="group"
            >
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="flex flex-col justify-between gap-4 p-5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`grid size-10 place-items-center rounded-xl ring-1 ${currencyTone(wallet.code)}`}
                    >
                      <Wallet className="size-5" />
                    </span>
                    <Badge variant="secondary" className="tabular-nums">
                      {wallet.code}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{wallet.name}</p>
                    <p
                      className="text-xl font-bold tabular-nums"
                      dir="ltr"
                      style={{ textAlign: "right" }}
                    >
                      {formatMoney(
                        wallet.balance,
                        wallet.decimalPlaces,
                        wallet.symbol,
                      )}
                    </p>
                  </div>

                  <span className="flex items-center gap-1 text-sm font-medium text-primary lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
                    <ArrowUpRight className="size-4" />
                    تبدیل ارز
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* تراکنش‌های اخیر */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-5 text-primary" />
            <h2 className="text-lg font-bold">تراکنش‌های اخیر</h2>
          </div>
          <Link
            href="/transactions"
            className="group flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            مشاهده همه
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-14 text-center text-muted-foreground">
                <span className="grid size-12 place-items-center rounded-2xl bg-muted">
                  <ArrowDownUp className="size-6" />
                </span>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">هنوز تراکنشی ندارید</p>
                  <p className="text-sm">
                    اولین تبدیل خود را از صفحه‌ی «تبدیل ارز» انجام دهید.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href="/exchange" />}
                >
                  شروع تبدیل
                </Button>
              </div>
            ) : (
              <ul className="divide-y">
                {recentTransactions.map((tx) => {
                  const source = tx.fromCurrency;
                  const quote = tx.toCurrency;
                  return (
                    <li
                      key={tx.id}
                      className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid size-10 place-items-center rounded-xl ring-1 ${currencyTone(quote?.code ?? source?.code ?? "")}`}
                        >
                          <ArrowDownUp className="size-4" />
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-bold">
                            {TYPE_LABEL[tx.type] ?? tx.type}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <code className="rounded bg-muted px-1 py-0.5">
                              {source?.code}
                            </code>
                            <span>→</span>
                            <code className="rounded bg-muted px-1 py-0.5">
                              {quote?.code}
                            </code>
                            <span>·</span>
                            {new Date(tx.createdAt).toLocaleDateString("fa-IR")}
                          </p>
                        </div>
                      </div>

                      <div className="text-end space-y-1">
                        <p className="font-bold tabular-nums" dir="ltr">
                          {source
                            ? `${formatMoney(tx.sourceAmount, source.decimalPlaces, source.symbol)}`
                            : formatMoney(tx.sourceAmount)}
                        </p>
                        <p className="text-xs text-success tabular-nums" dir="ltr">
                          {quote &&
                            quote.code !== source?.code &&
                            `+ ${formatMoney(tx.destinationAmount, quote.decimalPlaces, quote.symbol)}`}
                        </p>
                        <Badge
                          variant="outline"
                          className={`${STATUS_TONE[tx.status] === "success" ? "border-success/30 bg-success/10 text-success" : STATUS_TONE[tx.status] === "warning" ? "border-warning/30 bg-warning/10 text-warning" : "border-destructive/30 bg-destructive/10 text-destructive"}`}
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
      </section>
    </div>
  );
}