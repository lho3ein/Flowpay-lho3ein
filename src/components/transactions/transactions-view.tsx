"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowDownUp } from "lucide-react";
import { useEffect, useState } from "react";

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

const TYPE_LABEL: Record<string, string> = {
  EXCHANGE: "تبدیل",
};

const PAGE_SIZE = 20;

export function TransactionsView() {
  const [status, setStatus] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [fromCode, setFromCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  // وقتی فیلتر عوض می‌شود به صفحه اول برگرد
  useEffect(() => setPage(1), [status, type, fromCode, toCode, fromDate, toDate]);

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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">تراکنش‌ها</h1>
        <p className="text-sm text-muted-foreground">
          تاریخچه کامل تراکنش‌های شما
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
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

            <div className="space-y-1">
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

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">از (کد ارز)</span>
              <Input
                dir="ltr"
                placeholder="USD"
                value={fromCode}
                onChange={(e) => setFromCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">به (کد ارز)</span>
              <Input
                dir="ltr"
                placeholder="EUR"
                value={toCode}
                onChange={(e) => setToCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">از تاریخ</span>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="space-y-1">
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
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <ArrowDownUp className="size-8 opacity-40" />
              <p>تراکنشی یافت نشد.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>نوع</TableHead>
                  <TableHead>از</TableHead>
                  <TableHead>به</TableHead>
                  <TableHead>مبلغ</TableHead>
                  <TableHead>دریافتی</TableHead>
                  <TableHead>وضعیت</TableHead>
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
        <div className="flex items-center justify-between">
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
            <span className="text-sm tabular-nums">
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
      <TableRow className="cursor-pointer" onClick={() => setOpen(true)}>
        <TableCell className="text-nowrap">
          {new Date(tx.createdAt).toLocaleDateString("fa-IR")}
        </TableCell>
        <TableCell>
          <span className="flex items-center gap-1.5">
            <b>{TYPE_LABEL[tx.type] ?? tx.type}</b>
            {hasFilters && (
              <ArrowDownUp className="size-3.5 text-muted-foreground" />
            )}
          </span>
        </TableCell>
        <TableCell>
          <Badge variant="secondary">{tx.fromCurrency.code}</Badge>
        </TableCell>
        <TableCell>
          <Badge variant="secondary">{tx.toCurrency.code}</Badge>
        </TableCell>
        <TableCell className="tabular-nums">
          {formatMoney(
            tx.sourceAmount,
            tx.fromCurrency.decimalPlaces,
            tx.fromCurrency.symbol,
          )}
        </TableCell>
        <TableCell className="tabular-nums">
          {formatMoney(
            tx.destinationAmount,
            tx.toCurrency.decimalPlaces,
            tx.toCurrency.symbol,
          )}
        </TableCell>
        <TableCell>
          <Badge
            variant={
              tx.status === "COMPLETED"
                ? "default"
                : tx.status === "FAILED"
                  ? "destructive"
                  : "secondary"
            }
          >
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
              />
              <DetailItem
                label="مبلغ دریافتی"
                value={formatMoney(
                  detail.data.transaction.destinationAmount,
                  detail.data.transaction.toCurrency.decimalPlaces,
                  detail.data.transaction.toCurrency.symbol,
                )}
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

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium tabular-nums">{value}</p>
    </div>
  );
}