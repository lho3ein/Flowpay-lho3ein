import { Wallet } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-muted/40 p-4">
      <div className="pointer-events-none absolute -top-40 start-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -start-24 h-80 w-80 rounded-full bg-[var(--primary)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -end-24 top-1/3 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="absolute left-4 top-4">
        <ThemeToggle />
      </div>

      <Link
        href="/"
        className="relative z-10 flex items-center gap-2 text-2xl font-black text-foreground"
      >
        <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground shadow-lg shadow-primary/25">
          <Wallet className="size-5" />
        </span>
        فلوپی
      </Link>
      {children}
    </div>
  );
}