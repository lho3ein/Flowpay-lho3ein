"use client";
import React from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SessionProviderClient } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProviderClient>
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster richColors />
      </QueryProvider>
    </SessionProviderClient>
  );
}
