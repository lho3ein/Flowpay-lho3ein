import { Wallet } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-4">
      <Link
        href="/"
        className="flex items-center gap-2 text-2xl font-bold text-foreground"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Wallet className="size-5" />
        </span>
        فلوپی
      </Link>
      {children}
    </div>
  );
}