import { LogIn } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "ورود",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <LogIn className="size-6" />
          </div>
          <CardTitle className="text-2xl">ورود به فلوپی</CardTitle>
          <CardDescription>به کیف پول چندارزی خود دسترسی پیدا کنید</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 rounded-lg border bg-muted/50 p-3 text-xs leading-6 text-muted-foreground">
            <span className="font-semibold text-foreground">حساب نمونه:</span>{" "}
            demo@flowpay.app / Demo1234!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}