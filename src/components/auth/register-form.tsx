"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterInput } from "@/validations/auth.schema";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message ?? "ثبت‌نام ناموفق بود");
        return;
      }

      router.push("/login");
    } catch {
      setServerError("خطا در برقراری ارتباط با سرور");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <Field>
        <FieldLabel htmlFor="name">نام (اختیاری)</FieldLabel>
        <FieldContent>
          <Input
            id="name"
            placeholder="مثلاً: علی محمدی"
            autoComplete="name"
            aria-invalid={!!form.formState.errors.name}
            {...form.register("name")}
          />
          <FieldError errors={[form.formState.errors.name]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="email">ایمیل</FieldLabel>
        <FieldContent>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
          />
          <FieldError errors={[form.formState.errors.email]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="password">رمز عبور</FieldLabel>
        <FieldContent>
          <Input
            id="password"
            type="password"
            placeholder="حداقل ۸ کاراکتر"
            autoComplete="new-password"
            aria-invalid={!!form.formState.errors.password}
            {...form.register("password")}
          />
          <FieldError errors={[form.formState.errors.password]} />
        </FieldContent>
      </Field>

      <Button
        type="submit"
        className="w-full bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/25 hover:from-primary hover:to-indigo-600"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting && (
          <Loader2 className="ml-2 size-4 animate-spin" />
        )}
        ثبت‌نام
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        قبلاً حساب دارید؟{" "}
        <a
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          وارد شوید
        </a>
      </p>
    </form>
  );
}
