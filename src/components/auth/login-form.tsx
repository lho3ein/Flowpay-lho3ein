"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
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
import { loginSchema, type LoginInput } from "@/validations/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError("ایمیل یا رمز عبور اشتباه است");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <Field>
        <FieldLabel htmlFor="email">ایمیل</FieldLabel>
        <FieldContent>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            dir="ltr"
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
            placeholder="رمز عبور شما"
            autoComplete="current-password"
            aria-invalid={!!form.formState.errors.password}
            {...form.register("password")}
          />
          <FieldError errors={[form.formState.errors.password]} />
        </FieldContent>
      </Field>

      <Button
        type="submit"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting && (
          <Loader2 className="ml-2 size-4 animate-spin" />
        )}
        ورود
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        حساب ندارید؟{" "}
        <a
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ثبت‌نام کنید
        </a>
      </p>
    </form>
  );
}