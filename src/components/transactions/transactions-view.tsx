"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowDownUp, CalendarDays, ListFilter, ReceiptText } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Skeleton,
} from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, ApiError } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import type { TransactionListItemDto } from "@/types/models";

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: "موفق",
  PENDING: "در انتظار",
  FAILED: "ناموفق",
};

const STATUS_BADGE: Record<string, string> = {
  COMPLETED: "border-success/30 bg-success/10 text-success",
  PENDING: "border-warning/30 bg-warning/10 text-warning",
  FAILED: "border-destructive/30 bg-destructive/10 text-destructive",
};

const TYPE_LABEL: Record<string, string> = {
  EXCHANGE: "تبدیل",
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

const PAGE_SIZE = 20;

export function TransactionsView() {
  const [status, setStatus] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [fromCode, setFromCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  // با تغییر فیلترها صفحه به ۱ برگردد (در خودِ رندر، بدون effect)
  const filterSignature = [status, type, fromCode, toCode, fromDate, toDate].join("|");
  const [prevFilterSig, setPrevFilterSig] = useState(filterSignature);
  if (filterSignature !== prevFilterSig) {
    setPrevFilterSig(filterSignature);
    if (page !== 1) setPage(1);
  }

  const query = useQuery({
    queryKey: [
      "transactions",
      { status, type, fromCode, toCode, fromDate, toDate, page },
    ],
    queryFn: () =>
      api.getTransactions({
        page,
        limit: PAGE_SIZE,
        status: status ?? undefined,
        type: type ?? undefined,
        fromCode: fromCode.trim() || undefined,
        toCode: toCode.trim() || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }),
  });

  const items = query.data?.items ?? [];

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-black sm:text-3xl">
          <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ReceiptText className="size-5" />
          </span>
          تراکنش‌ها
        </h1>
        <p className="text-sm text-muted-foreground">
          تاریخچه‌ی کامل تراکنش‌های شما
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ListFilter className="size-4 text-primary" />
            فیلترها
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">وضعیت</span>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="همه" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPLETED">موفق</SelectItem>
                  <SelectItem value="PENDING">در انتظار</SelectItem>
                  <SelectItem value="FAILED">ناموفق</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">نوع</span>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="همه" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXCHANGE">تبدیل</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">از → به (کد ارز)</span>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  dir="ltr"
                  placeholder="USD"
                  value={fromCode}
                  onChange={(e) => setFromCode(e.target.value.toUpperCase())}
                />
                <Input
                  dir="ltr"
                  placeholder="EUR"
                  value={toCode}
                  onChange={(e) => setToCode(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">از تاریخ</span>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">تا تاریخ</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {query.isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : query.isError ? (
            <p className="p-6 text-center text-destructive">
              {query.error instanceof ApiError
                ? query.error.message
                : "خطا در دریافت تراکنش‌ها"}
            </p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
              <span className="grid size-12 place-items-center rounded-2xl bg-muted">
                <ArrowDownUp className="size-6" />
              </span>
              <div className="space-y-1">
                <p className="font-medium text-foreground">تراکنشی یافت نشد.</p>
                <p className="text-sm">فیلترها را تغییر دهید یا یک تبدیل انجام دهید.</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">تاریخ</TableHead>
                  <TableHead className="text-muted-foreground">نوع</TableHead>
                  <TableHead className="text-muted-foreground">از</TableHead>
                  <TableHead className="text-muted-foreground">به</TableHead>
                  <TableHead className="text-muted-foreground">مبلغ</TableHead>
                  <TableHead className="text-muted-foreground">دریافتی</TableHead>
                  <TableHead className="text-muted-foreground">وضعیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {query.data && query.data.totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {query.data.total.toLocaleString("fa-IR")} تراکنش
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              قبلی
            </Button>
            <span className="rounded-lg bg-card px-2.5 py-1 text-sm tabular-nums ring-1 ring-foreground/10">
              {page.toLocaleString("fa-IR")} /{" "}
              {query.data.totalPages.toLocaleString("fa-IR")}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= query.data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              بعدی
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionRow({ tx }: { tx: TransactionListItemDto }) {
  const [open, setOpen] = useState(false);
  const detail = useQuery({
    queryKey: ["transaction", tx.id],
    queryFn: () => api.getTransaction(tx.id),
    enabled: open,
  });

  const hasFilters =
    tx.fromCurrency.code !== tx.toCurrency.code &&
    tx.type === "EXCHANGE";

  return (
    <>
      <TableRow
        className="cursor-pointer transition-colors hover:bg-muted/50"
        onClick={() => setOpen(true)}
      >
        <TableCell className="text-nowrap text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {new Date(tx.createdAt).toLocaleDateString("fa-IR")}
          </span>
        </TableCell>
        <TableCell>
          <span className="flex items-center gap-1.5 font-medium">
            {TYPE_LABEL[tx.type] ?? tx.type}
            {hasFilters && <ArrowDownUp className="size-3.5 text-muted-foreground" />}
          </span>
        </TableCell>
        <TableCell>
          <span
            className={`rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums ring-1 ${currencyTone(tx.fromCurrency.code)}`}
          >
            {tx.fromCurrency.code}
          </span>
        </TableCell>
        <TableCell>
          <span
            className={`rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums ring-1 ${currencyTone(tx.toCurrency.code)}`}
          >
            {tx.toCurrency.code}
          </span>
        </TableCell>
        <TableCell className="font-medium tabular-nums" dir="ltr">
          {formatMoney(
            tx.sourceAmount,
            tx.fromCurrency.decimalPlaces,
            tx.fromCurrency.symbol,
          )}
        </TableCell>
        <TableCell className="font-medium text-success tabular-nums" dir="ltr">
          {formatMoney(
            tx.destinationAmount,
            tx.toCurrency.decimalPlaces,
            tx.toCurrency.symbol,
          )}
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={STATUS_BADGE[tx.status] ?? ""}>
            {STATUS_LABEL[tx.status] ?? tx.status}
          </Badge>
        </TableCell>
      </TableRow>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>جزئیات تراکنش</DialogTitle>
            <DialogDescription>
              شناسه: <span dir="ltr">{tx.id}</span>
            </DialogDescription>
          </DialogHeader>

          {detail.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
            </div>
          ) : detail.isError ? (
            <p className="text-sm text-destructive">
              {detail.error instanceof ApiError
                ? detail.error.message
                : "خطا در دریافت جزئیات"}
            </p>
          ) : detail.data ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <DetailItem
                label="مبلغ مبدأ"
                value={formatMoney(
                  detail.data.transaction.sourceAmount,
                  detail.data.transaction.fromCurrency.decimalPlaces,
                  detail.data.transaction.fromCurrency.symbol,
                )}
                tone={currencyTone(detail.data.transaction.fromCurrency.code)}
              />
              <DetailItem
                label="مبلغ دریافتی"
                value={formatMoney(
                  detail.data.transaction.destinationAmount,
                  detail.data.transaction.toCurrency.decimalPlaces,
                  detail.data.transaction.toCurrency.symbol,
                )}
                tone="text-success"
              />
              <DetailItem
                label="کارمزد"
                value={formatMoney(
                  detail.data.transaction.fee,
                  detail.data.transaction.fromCurrency.decimalPlaces,
                  detail.data.transaction.fromCurrency.symbol,
                )}
              />
              <DetailItem
                label="نرخ"
                value={formatMoney(detail.data.transaction.exchangeRate, 10)}
              />
              <DetailItem
                label="وضعیت"
                value={STATUS_LABEL[detail.data.transaction.status] ?? detail.data.transaction.status}
                tone={STATUS_BADGE[detail.data.transaction.status]}
              />
              <DetailItem
                label="تاریخ"
                value={new Date(detail.data.transaction.createdAt).toLocaleString("fa-IR")}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function DetailItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-medium tabular-nums ${tone ?? ""}`}>{value}</p>
    </div>
  );
}