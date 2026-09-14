import { Construction } from "lucide-react";

export const metadata = {
  title: "تراکنش‌ها",
};

export default function TransactionsPlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="grid size-16 place-items-center rounded-3xl bg-muted">
        <Construction className="size-8 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold">تراکنش‌ها</h1>
      <p className="text-muted-foreground">
        تاریخچه تراکنش‌های شما به‌زودی در این صفحه اضافه می‌شود.
      </p>
    </div>
  );
}