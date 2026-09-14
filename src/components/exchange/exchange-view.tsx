"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Decimal from "decimal.js";
import { ArrowDownUp, Loader2, RefreshCw } from "lucide-react";
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

export function ExchangeView({ initialSource }: { initialSource?: string }) {
  const queryClient = useQueryClient();

  const walletsQuery = useQuery({ queryKey: ["wallets"], queryFn: api.getWallets });
  const wallets = walletsQuery.data?.wallets ?? [];

  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [debouncedAmount, setDebouncedAmount] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedAmount(amount), 400);
    return () => clearTimeout(timer);
  }, [amount]);

  // انتخاب اولیه از پارامتر ?source=
  useEffect(() => {
    const candidates = wallets.map((w) => w.currency.code);
    if (from) return;
    if (initialSource && candidates.includes(initialSource)) {
      setFrom(initialSource);
      const rest = candidates.filter((c) => c !== initialSource);
      if (rest.length) setTo(rest[0]);
    } else if (candidates.length > 0) {
      setFrom(candidates[0]);
      if (candidates.length > 1) setTo(candidates[1]);
    }
  }, [wallets, from, initialSource]);

  // کلید یکتای درخواست؛ با تغییر پارامترها مجدد ساخته می‌شود
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() =>
    crypto.randomUUID(),
  );
  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, [from, to, debouncedAmount]);

  const sourceWallet = useMemo(
    () => wallets.find((w) => w.currency.code === from) ?? null,
    [wallets, from],
  );

  const toOptions = useMemo(
    () => wallets.filter((w) => w.currency.code !== from),
    [wallets, from],
  );

  const amountError = useMemo(() => {
    if (!debouncedAmount) return null;
    if (!AMOUNT_PATTERN.test(debouncedAmount)) return "مبلغ واردشده نامعتبر است";
    if (/^0+(\.0+)?$/.test(debouncedAmount)) return "مبلغ باید بزرگ‌تر از صفر باشد";
    if (
      sourceWallet &&
      hasExcessFractionDigits(debouncedAmount, sourceWallet.currency.decimalPlaces)
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
    Boolean(from && to && from !== to) && amountValid && !insufficient;

  const quoteQuery = useQuery({
    queryKey: ["exchange-quote", from, to, debouncedAmount],
    queryFn: () => api.getExchangeQuote(from!, to!, debouncedAmount),
    enabled: quoteEnabled,
  });

  const exchangeMutation = useMutation({
    mutationFn: () =>
      api.executeExchange({
        fromCode: from!,
        toCode: to!,
        sourceAmount: debouncedAmount,
        idempotencyKey,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      if (data.replayed) {
        toast.info("این درخواست قبلاً ثبت شده بود.");
      } else {
        toast.success("تبدیل ارز با موفقیت انجام شد");
      }
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "خطا در انجام تبدیل");
    },
  });

  function swap() {
    setFrom(to);
    setTo(from);
  }

  const sourceCurrency = sourceWallet?.currency;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">تبدیل ارز</h1>
        <p className="text-sm text-muted-foreground">
          تبدیل امن و آنی بین ارزهای کیف پول شما
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">جزئیات تبدیل</CardTitle>
          <CardDescription>
            نرخ لحظه‌ای از سرویس نرخ ارز خوانده می‌شود
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <Field>
              <FieldLabel>از</FieldLabel>
              <FieldContent>
                <Select value={from} onValueChange={setFrom}>
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
              disabled={!from && !to}
              aria-label="جابه‌جایی ارزها"
            >
              <ArrowDownUp className="size-4" />
            </Button>

            <Field>
              <FieldLabel>به</FieldLabel>
              <FieldContent>
                <Select value={to} onValueChange={setTo}>
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
                placeholder="0.00"
                value={amount}
                aria-invalid={!!amountError}
                onChange={(e) => setAmount(e.target.value)}
              />
              {sourceCurrency && (
                <FieldDescription>
                  موجودی:{" "}
                  {formatMoney(
                    sourceWallet!.balance,
                    sourceCurrency.decimalPlaces,
                    sourceCurrency.symbol,
                  )}
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
        <CardHeader>
          <CardTitle className="text-base">نقل قول</CardTitle>
        </CardHeader>
        <CardContent>
          {quoteQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ) : quoteQuery.isError ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {quoteQuery.error instanceof ApiError
                ? quoteQuery.error.message
                : "خطا در دریافت نقل قول"}
            </div>
          ) : quoteQuery.data ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">نرخ</span>
                <span className="font-semibold tabular-nums" dir="ltr">
                  1 {from} ={" "}
                  {Number(quoteQuery.data.quote.rate).toLocaleString("fa-IR", {
                    maximumFractionDigits: 10,
                  })}{" "}
                  {to}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">کارمزد (۰٫۷۵٪)</span>
                <span className="tabular-nums">
                  {formatMoney(
                    quoteQuery.data.quote.fee,
                    quoteQuery.data.source.decimalPlaces,
                    quoteQuery.data.source.symbol,
                  )}
                </span>
              </div>
              <div className="space-y-1 rounded-lg border bg-muted/50 p-3">
                <span className="text-xs text-muted-foreground">
                  مبلغ دریافتی
                </span>
                <p className="text-xl font-bold tabular-nums">
                  {formatMoney(
                    quoteQuery.data.quote.destinationAmount,
                    quoteQuery.data.target.decimalPlaces,
                    quoteQuery.data.target.symbol,
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              ارزها و مبلغ معتبر را وارد کنید تا نقل قول نمایش داده شود.
            </p>
          )}
        </CardContent>
      </Card>

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              className="w-full"
              disabled={
                !quoteQuery.data ||
                quoteQuery.isError ||
                exchangeMutation.isPending ||
                !!amountError ||
                !!insufficient
              }
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
                      {Number(quoteQuery.data.quote.rate).toLocaleString("fa-IR", {
                        maximumFractionDigits: 10,
                      })}
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

      {from && to && (
        <div className="flex justify-center">
          <Badge variant="secondary">
            تبدیل از {from} به {to}
          </Badge>
        </div>
      )}
    </div>
  );
}