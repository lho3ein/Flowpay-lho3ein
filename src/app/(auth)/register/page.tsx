import { Wallet } from "lucide-react";

import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "ثبت‌نام",
};

export default function RegisterPage() {
  return (
    <div className="relative z-10 w-full max-w-md">
      <Card className="border-foreground/10 shadow-xl shadow-primary/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground shadow-lg shadow-primary/25">
            <Wallet className="size-7" />
          </div>
          <CardTitle className="text-2xl font-black">ایجاد حساب کاربری</CardTitle>
          <CardDescription>
            کیف پول چندارزی خود را در فلوپی بسازید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}