"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="تغییر قالب" />
        }
      >
        <Sun className="size-5 dark:hidden" />
        <Moon className="hidden size-5 dark:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          روشن
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          تیره
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          پیش‌فرض سیستم
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}