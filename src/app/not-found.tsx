import { FileQuestion } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="grid size-16 place-items-center rounded-3xl bg-muted">
        <FileQuestion className="size-8 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold">صفحه موردنظر پیدا نشد</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        نشانی واردشده معتبر نیست یا این صفحه حذف شده است.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>بازگشت به خانه</Button>
    </div>
  );
}