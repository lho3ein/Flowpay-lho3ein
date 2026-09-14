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
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <LogIn className="size-6" />
          </div>
          <CardTitle className="text-2xl">ورود به فلوپی</CardTitle>
          <CardDescription>
            به کیف پول چندارزی خود دسترسی پیدا کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm form={form} />
          <div className="flex items-center mt-4 space-x-2 rounded-lg border bg-muted/50 p-3 text-xs leading-6 text-muted-foreground">
            <span className="font-semibold text-foreground">حساب نمونه:</span>
            <span>demo@flowpay.app / @Demo1234</span>
            <FillDemoUser form={form} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
