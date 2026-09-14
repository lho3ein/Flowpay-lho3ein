import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth } from "@/lib/auth";

import { DashboardNav } from "@/components/nav/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <DashboardNav user={session.user} />
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}