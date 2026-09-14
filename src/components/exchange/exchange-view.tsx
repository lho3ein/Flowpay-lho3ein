"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Decimal from "decimal.js";
import {
  ArrowDownUp,
  BadgePercent,
  Loader2,
  RefreshCw,
  Scale,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError } from "@/lib/api-client";
import { hasExcessFractionDigits } from "@/lib/exchange";
import { formatMoney } from "@/lib/format";

const AMOUNT_PATTERN = /^\d{1,14}(\.\d{1,8})?$/;

const CURRENCY_TONE: Record<string, string> = {
  USD: "bg-currency-usd/12 text-currency-usd ring-currency-usd/30",
  EUR: "bg-currency-eur/12 text-currency-eur ring-currency-eur/30",
  GBP: "bg-currency-gbp/12 text-currency-gbp ring-currency-gbp/30",
  AED: "bg-currency-aed/12 text-currency-aed ring-currency-aed/30",
};

function currencyTone(code: string) {
  return CURRENCY_TONE[code] ?? "bg-primary/10 text-primary ring-primary/30";
}

export function ExchangeView({ initialSource }: { initialSource?: string }) {
  const queryClient = useQueryClient();

  const walletsQuery = useQuery({
    queryKey: ["wallets"],
    queryFn: api.getWallets,
  });
  const wallets = useMemo(
    () => walletsQuery.data?.wallets ?? [],
    [walletsQuery.data],
  );

  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [debouncedAmount, setDebouncedAmount] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedAmount(amount), 400);
    return () => clearTimeout(timer);
  }, [amount]);

  // انتخاب پیش‌فرض ارزها به‌صورت مقدار مشتق‌شده در رندر (بدون effect)
  const candidates = wallets.map((w) => w.currency.code);
  const effectiveFrom =
    from ??
    (initialSource && candidates.includes(initialSource)
      ? initialSource
      : (candidates[0] ?? null));
  const effectiveTo =
    to ??
    (effectiveFrom
      ? (candidates.find((c) => c !== effectiveFrom) ?? null)
      : null);

  // کلید یکتای درخواست؛ با تغییر پارامترها هنگام رندر، دوباره ساخته می‌شود
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() =>
    crypto.randomUUID(),
  );
  const paramSig = `${effectiveFrom}|${effectiveTo}|${debouncedAmount}`;
  const [prevParamSig, setPrevParamSig] = useState(paramSig);
  if (paramSig !== prevParamSig) {
    setPrevParamSig(paramSig);
    setIdempotencyKey(crypto.randomUUID());
  }

  const sourceWallet = useMemo(
    () => wallets.find((w) => w.currency.code === effectiveFrom) ?? null,
    [wallets, effectiveFrom],
  );

  const toOptions = useMemo(
    () => wallets.filter((w) => w.currency.code !== effectiveFrom),
    [wallets, effectiveFrom],
  );

  const amountError = useMemo(() => {
    if (!debouncedAmount) return null;
    if (!AMOUNT_PATTERN.test(debouncedAmount))
      return "مبلغ واردشده نامعتبر است";
    if (/^0+(\.0+)?$/.test(debouncedAmount))
      return "مبلغ باید بزرگ‌تر از صفر باشد";
    if (
      sourceWallet &&
      hasExcessFractionDigits(
        debouncedAmount,
        sourceWallet.currency.decimalPlaces,
      )
    )
      return `حداکثر ${sourceWallet.currency.decimalPlaces} رقم اعشار مجاز است`;
    return null;
  }, [debouncedAmount, sourceWallet]);

  const amountValid = Boolean(debouncedAmount) && !amountError;

  const insufficient = useMemo(() => {
    if (!sourceWallet || !amountValid) return false;
    return new Decimal(sourceWallet.balance).lessThan(debouncedAmount);
  }, [sourceWallet, debouncedAmount, amountValid]);

  const quoteEnabled =
    Boolean(effectiveFrom && effectiveTo && effectiveFrom !== effectiveTo) &&
    amountValid &&
    !insufficient;

  const quoteQuery = useQuery({
    queryKey: ["exchange-quote", effectiveFrom, effectiveTo, debouncedAmount],
    queryFn: () =>
      api.getExchangeQuote(effectiveFrom!, effectiveTo!, debouncedAmount),
    enabled: quoteEnabled,
  });

  const exchangeMutation = useMutation({
    mutationFn: () =>
      api.executeExchange({
        fromCode: effectiveFrom!,
        toCode: effectiveTo!,
        sourceAmount: debouncedAmount,
        idempotencyKey,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      setConfirmOpen(false);
      setAmount("");
      if (data.replayed) {
        toast.info("این درخواست قبلاً ثبت شده بود.");
      } else {
        toast.success("تبدیل ارز با موفقیت انجام شد");
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "خطا در انجام تبدیل",
      );
    },
  });

  function swap() {
    setFrom(effectiveTo);
    setTo(effectiveFrom);
  }

  const sourceCurrency = sourceWallet?.currency;
  const canSubmit = Boolean(
    quoteQuery.data && !quoteQuery.isError && !amountError && !insufficient,
  );

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-black sm:text-3xl">
          <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ArrowDownUp className="size-5" />
          </span>
          تبدیل ارز
        </h1>
        <p className="text-sm text-muted-foreground">
          تبدیل امن و آنی بین ارزهای کیف پول شما
        </p>
      </div>

      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-primary/8 to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-4 text-primary" />
            جزئیات تبدیل
          </CardTitle>
          <CardDescription>
            نرخ لحظه‌ای از سرویس نرخ ارز خوانده می‌شود
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <Field>
              <FieldLabel>از</FieldLabel>
              <FieldContent>
                <Select value={effectiveFrom} onValueChange={setFrom}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="انتخاب ارز" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((w) => (
                      <SelectItem key={w.id} value={w.currency.code}>
                        {w.currency.code} — {w.currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mb-0.5"
              onClick={swap}
              disabled={!effectiveFrom && !effectiveTo}
              aria-label="جابه‌جایی ارزها"
            >
              <ArrowDownUp className="size-4" />
            </Button>

            <Field>
              <FieldLabel>به</FieldLabel>
              <FieldContent>
                <Select value={effectiveTo} onValueChange={setTo}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="انتخاب ارز" />
                  </SelectTrigger>
                  <SelectContent>
                    {toOptions.map((w) => (
                      <SelectItem key={w.id} value={w.currency.code}>
                        {w.currency.code} — {w.currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="amount">مبلغ مبدأ</FieldLabel>
            <FieldContent>
              <Input
                id="amount"
                inputMode="decimal"
                dir="ltr"
                placeholder={"0.00"}
                value={amount}
                aria-invalid={!!amountError}
                onChange={(e) => setAmount(e.target.value)}
              />
              {sourceCurrency && (
                <FieldDescription className="flex items-center gap-1.5">
                  <span
                    className={`grid size-5 place-items-center rounded-full text-xs ring-1 ${currencyTone(sourceCurrency.code)}`}
                  >
                    {sourceCurrency.code.slice(0, 1)}
                  </span>
                  موجودی:{" "}
                  <b className="tabular-nums">
                    {formatMoney(
                      sourceWallet!.balance,
                      sourceCurrency.decimalPlaces,
                      sourceCurrency.symbol,
                    )}
                  </b>
                </FieldDescription>
              )}
              <FieldError errors={[{ message: amountError ?? undefined }]} />
              {insufficient && (
                <FieldError errors={[{ message: "موجودی کافی نیست" }]} />
              )}
            </FieldContent>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="size-4 text-primary" />
            نقل‌قول
          </CardTitle>
          {quoteQuery.data && (
            <Badge className="border-success/30 bg-success/10 text-success">
              به‌روز
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {quoteQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ) : quoteQuery.isError ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {quoteQuery.error instanceof ApiError
                ? quoteQuery.error.message
                : "خطا در دریافت نقل قول"}
            </div>
          ) : quoteQuery.data ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-muted/70 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">نرخ</span>
                  <span className="font-semibold tabular-nums" dir="ltr">
                    1 {effectiveFrom} ={" "}
                    {Number(quoteQuery.data.quote.rate).toLocaleString(
                      "fa-IR",
                      {
                        maximumFractionDigits: 10,
                      },
                    )}{" "}
                    {effectiveTo}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <BadgePercent className="size-4" />
                  کارمزد (۰٫۷۵٪)
                </span>
                <span className="tabular-nums">
                  {formatMoney(
                    quoteQuery.data.quote.fee,
                    quoteQuery.data.source.decimalPlaces,
                    quoteQuery.data.source.symbol,
                  )}
                </span>
              </div>
              <div className="space-y-1.5 rounded-2xl bg-linear-to-l from-primary/10 to-transparent p-4 ring-1 ring-primary/20">
                <span className="text-xs font-medium text-muted-foreground">
                  مبلغ دریافتی
                </span>
                <div className="flex items-center justify-between">
                  <span
                    className={`grid size-9 place-items-center rounded-xl ring-1 ${currencyTone(effectiveTo ?? "")}`}
                  >
                    <ArrowDownUp className="size-4" />
                  </span>
                  <p className="text-2xl font-black tabular-nums">
                    {formatMoney(
                      quoteQuery.data.quote.destinationAmount,
                      quoteQuery.data.target.decimalPlaces,
                      quoteQuery.data.target.symbol,
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              ارزها و مبلغ معتبر را وارد کنید تا نقل قول نمایش داده شود.
            </p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogTrigger
          render={
            <Button
              size="lg"
              className="w-full"
              disabled={!canSubmit || exchangeMutation.isPending}
            >
              {exchangeMutation.isPending && (
                <Loader2 className="ml-2 size-4 animate-spin" />
              )}
              <RefreshCw className="ml-2 size-4" />
              انجام تبدیل
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأیید نهایی تبدیل</AlertDialogTitle>
            <AlertDialogDescription>
              این عملیات نهایی است و قابل بازگشت نیست.
              {quoteQuery.data && (
                <span className="mt-2 block space-y-1">
                  <span className="block">
                    مبدأ:{" "}
                    <b className="tabular-nums">
                      {formatMoney(
                        quoteQuery.data.quote.sourceAmount,
                        quoteQuery.data.source.decimalPlaces,
                        quoteQuery.data.source.symbol,
                      )}
                    </b>
                  </span>
                  <span className="block">
                    دریافتی:{" "}
                    <b className="tabular-nums">
                      {formatMoney(
                        quoteQuery.data.quote.destinationAmount,
                        quoteQuery.data.target.decimalPlaces,
                        quoteQuery.data.target.symbol,
                      )}
                    </b>
                  </span>
                  <span className="block">
                    نرخ:{" "}
                    <b className="tabular-nums" dir="ltr">
                      {Number(quoteQuery.data.quote.rate).toLocaleString(
                        "fa-IR",
                        {
                          maximumFractionDigits: 10,
                        },
                      )}
                    </b>
                  </span>
                  <span className="block">
                    کارمزد:{" "}
                    <b className="tabular-nums">
                      {formatMoney(
                        quoteQuery.data.quote.fee,
                        quoteQuery.data.source.decimalPlaces,
                        quoteQuery.data.source.symbol,
                      )}
                    </b>
                  </span>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              disabled={exchangeMutation.isPending}
              onClick={() => exchangeMutation.mutate()}
            >
              {exchangeMutation.isPending && (
                <Loader2 className="ml-2 size-4 animate-spin" />
              )}
              تأیید و انجام
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
