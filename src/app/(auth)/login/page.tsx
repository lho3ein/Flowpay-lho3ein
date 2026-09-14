"use client";
import { LogIn } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FillDemoUser } from "@/components/auth/fill-demo-user";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginInput, loginSchema } from "@/validations/auth.schema";
import { useForm } from "react-hook-form";

// export const metadata = {
//   title: "ورود",
// };

export default function LoginPage() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  return (
    <div className="relative z-10 w-full max-w-md">
      <Card className="border-foreground/10 shadow-xl shadow-primary/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-linear-to-br from-primary to-indigo-600 text-primary-foreground shadow-lg shadow-primary/25">
            <LogIn className="size-7" />
          </div>
          <CardTitle className="text-2xl font-black">ورود به فلوپی</CardTitle>
          <CardDescription>
            به کیف پول چندارزی خود دسترسی پیدا کنید
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm form={form} />
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-foreground/15 bg-muted/50 p-3 text-xs leading-6 text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">
                حساب نمونه:{" "}
              </span>
              <span dir="ltr">demo@flowpay.app / @Demo1234</span>
            </span>
            <FillDemoUser form={form} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
