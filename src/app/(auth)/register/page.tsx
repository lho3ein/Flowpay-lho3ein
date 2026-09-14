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
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Wallet className="size-6" />
          </div>
          <CardTitle className="text-2xl">ایجاد حساب کاربری</CardTitle>
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