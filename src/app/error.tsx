"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="grid size-16 place-items-center rounded-3xl bg-destructive/10">
        <AlertTriangle className="size-8 text-destructive" />
      </div>
      <h1 className="text-xl font-bold">خطایی رخ داد</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        متأسفانه در پردازش درخواست مشکلی پیش آمد. دوباره تلاش کنید.
      </p>
      <Button onClick={reset}>تلاش مجدد</Button>
    </div>
  );
}