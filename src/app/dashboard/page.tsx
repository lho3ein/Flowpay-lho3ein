import { Wallet } from "lucide-react";

export const metadata = {
  title: "داشبورد",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="grid size-16 place-items-center rounded-3xl bg-primary/10 text-primary">
        <Wallet className="size-8" />
      </div>
      <h1 className="text-2xl font-bold">به فلوپی خوش آمدید</h1>
      <p className="max-w-md text-muted-foreground">
        نمای کلی دارایی‌ها و تراکنش‌های شما به‌زودی اینجا نمایش داده می‌شود.
      </p>
    </div>
  );
}