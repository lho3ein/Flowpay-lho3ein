"use client";

import { signOut } from "next-auth/react";
import { LogOut, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { href: "/dashboard", label: "داشبورد" },
  { href: "/wallets", label: "کیف پول‌ها" },
  { href: "/exchange", label: "تبدیل ارز" },
  { href: "/transactions", label: "تراکنش‌ها" },
];

export function DashboardNav({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = (user.name ?? user.email ?? "؟")
    .trim()
    .slice(0, 2)
    .toUpperCase();

  const navClass = (href: string) =>
    `flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-black"
          >
            <span className="grid size-8 place-items-center rounded-xl bg-linear-to-br from-primary to-indigo-600 text-primary-foreground shadow-md shadow-primary/25">
              <Wallet className="size-4" />
            </span>
            فلوپی
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs sm:text-base ${navClass(item.href)}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="rounded-full p-1.5">
                  <Avatar className="size-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium">
                    {user.name ?? "کاربر"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer hover:bg-accent/15"
                onClick={async () => {
                  await signOut({ redirect: false });
                  router.push("/");
                }}
              >
                <LogOut className="ml-2 size-4" />
                خروج از حساب
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* منوی موبایل */}
      {/* <nav className="flex items-center gap-2 overflow-x-auto border-t bg-background/80 px-4 py-2 backdrop-blur md:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap ${navClass(item.href)}`}
          >
            {item.label}
          </Link>
        ))}
      </nav> */}
    </header>
  );
}
