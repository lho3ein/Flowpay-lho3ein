import { Construction } from "lucide-react";

export const metadata = {
  title: "تبدیل ارز",
};

export default function ExchangePlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="grid size-16 place-items-center rounded-3xl bg-muted">
        <Construction className="size-8 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold">تبدیل ارز</h1>
      <p className="text-muted-foreground">
        فرم تبدیل ارز به‌زودی در این صفحه اضافه می‌شود.
      </p>
    </div>
  );
}